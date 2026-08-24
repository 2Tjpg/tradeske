'use client';

import { useEffect, useRef, useState } from 'react';
import type { BuyResult, DerivWS } from '@deriv/core';
import type { ContractMode } from '@/lib/types';

interface OpenContractUpdate {
    contract_id: number | string;
    current_spot?: number | string;
    current_spot_display?: number | string;
    is_sold?: number;
    is_expired?: number;
    status?: string;
}

interface UseTradeChartTrackingReturn {
    hudProfit: number | null;
    hudMounted: boolean;
    hudVisible: boolean;
    hudSettled: boolean;
}

function lastDigit(value: unknown): number | null {
    if (typeof value === 'string') {
        const digits = value.trim().replace(/[^0-9]/g, '');
        if (digits.length > 0) return Number(digits[digits.length - 1]);
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        const digits = String(value).replace(/[^0-9]/g, '');
        if (digits.length > 0) return Number(digits[digits.length - 1]);
    }

    return null;
}

function isWinningDigit(digit: number, mode: ContractMode, prediction: number): boolean {
    switch (mode) {
        case 'DIGITMATCH': return digit === prediction;
        case 'DIGITDIFF': return digit !== prediction;
        case 'DIGITOVER': return digit > prediction;
        case 'DIGITUNDER': return digit < prediction;
        case 'DIGITEVEN': return digit % 2 === 0;
        case 'DIGITODD': return digit % 2 !== 0;
    }
}

export function useTradeChartTracking(
    ws: DerivWS | null,
    isConnected: boolean,
    buyResult: BuyResult | null,
    contractMode: ContractMode,
    selectedDigit: number
): UseTradeChartTrackingReturn {
    const [contractId, setContractId] = useState<number | null>(null);
    const [hudProfit, setHudProfit] = useState<number | null>(null);
    const [hudMounted, setHudMounted] = useState(false);
    const [hudVisible, setHudVisible] = useState(false);
    const [hudSettled, setHudSettled] = useState(false);
    const stakeRef = useRef(0);
    const potentialProfitRef = useRef(0);
    const modeRef = useRef<ContractMode>(contractMode);
    const predictionRef = useRef(selectedDigit);
    const settlementTimerRef = useRef<number | null>(null);
    const fadeTimerRef = useRef<number | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        modeRef.current = contractMode;
        predictionRef.current = selectedDigit;
    }, [contractMode, selectedDigit]);

    useEffect(() => {
        if (!buyResult) return;
        if (settlementTimerRef.current !== null) window.clearTimeout(settlementTimerRef.current);
        if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);

        stakeRef.current = Math.abs(buyResult.buyPrice);
        potentialProfitRef.current = Math.max(0, buyResult.payout - stakeRef.current);
        setContractId(buyResult.contractId);
        setHudProfit(-stakeRef.current);
        setHudMounted(true);
        setHudVisible(true);
        setHudSettled(false);
    }, [buyResult]);

    useEffect(() => {
        if (!ws || !isConnected || contractId === null) return;

        let disposed = false;
        let unsubscribe = () => { };

        const handleUpdate = (message: Record<string, unknown>) => {
            if (message.msg_type !== 'proposal_open_contract') return;
            const update = message.proposal_open_contract as OpenContractUpdate | undefined;
            if (!update || Number(update.contract_id) !== contractId) return;

            const spot = update.current_spot_display ?? update.current_spot;
            const digit = lastDigit(spot);
            const status = update.status?.toLowerCase();
            const settled = !!update.is_sold || !!update.is_expired ||
                ['settled', 'sold', 'won', 'lost'].includes(status ?? '');
            const settledWin = status === 'won' || (settled && status !== 'lost' && digit !== null &&
                isWinningDigit(digit, modeRef.current, predictionRef.current));
            const winning = settled ? settledWin : digit !== null &&
                isWinningDigit(digit, modeRef.current, predictionRef.current);

            if (digit !== null) setHudProfit(winning ? potentialProfitRef.current : -stakeRef.current);

            if (settled && !disposed) {
                setHudSettled(true);
                unsubscribeRef.current?.();
                unsubscribeRef.current = null;
                setContractId(null);
                settlementTimerRef.current = window.setTimeout(() => {
                    setHudVisible(false);
                    settlementTimerRef.current = null;
                    fadeTimerRef.current = window.setTimeout(() => {
                        setHudMounted(false);
                        setHudProfit(null);
                        setHudSettled(false);
                        stakeRef.current = 0;
                        potentialProfitRef.current = 0;
                        fadeTimerRef.current = null;
                    }, 300);
                }, 3000);
            }
        };

        ws.subscribe({ proposal_open_contract: 1, contract_id: contractId }, handleUpdate)
            .then(subscription => {
                if (disposed) subscription.unsubscribe();
                else {
                    unsubscribe = subscription.unsubscribe;
                    unsubscribeRef.current = subscription.unsubscribe;
                }
            })
            .catch(() => { });

        return () => {
            disposed = true;
            unsubscribe();
            if (unsubscribeRef.current === unsubscribe) unsubscribeRef.current = null;
        };
    }, [contractId, isConnected, ws]);

    useEffect(() => () => {
        if (settlementTimerRef.current !== null) window.clearTimeout(settlementTimerRef.current);
        if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
    }, []);

    return { hudProfit, hudMounted, hudVisible, hudSettled };
}
