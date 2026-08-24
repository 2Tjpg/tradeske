'use client';

import { useEffect, useRef, useState } from 'react';
import type { BuyResult, DerivWS } from '@deriv/core';

interface OpenContractUpdate {
    contract_id: number;
    profit?: number | string;
    is_sold?: number;
    is_expired?: number;
    status?: string;
}

interface UseTradeChartTrackingReturn {
    hudProfit: number | null;
    hudMounted: boolean;
    hudVisible: boolean;
}

function numeric(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value)
        ? value
        : typeof value === 'string' && Number.isFinite(Number(value))
            ? Number(value)
            : null;
}

export function useTradeChartTracking(
    ws: DerivWS | null,
    isConnected: boolean,
    buyResult: BuyResult | null
): UseTradeChartTrackingReturn {
    const [contractId, setContractId] = useState<number | null>(null);
    const [hudProfit, setHudProfit] = useState<number | null>(null);
    const stakeRef = useRef(0);
    const [hudMounted, setHudMounted] = useState(false);
    const [hudVisible, setHudVisible] = useState(false);
    const settlementTimerRef = useRef<number | null>(null);
    const fadeTimerRef = useRef<number | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!buyResult) return;
        if (settlementTimerRef.current !== null) {
            window.clearTimeout(settlementTimerRef.current);
            settlementTimerRef.current = null;
        }
        if (fadeTimerRef.current !== null) {
            window.clearTimeout(fadeTimerRef.current);
            fadeTimerRef.current = null;
        }
        setHudMounted(true);
        setHudVisible(true);
        setContractId(buyResult.contractId);
        stakeRef.current = Math.abs(buyResult.buyPrice);
        setHudProfit(-stakeRef.current);
        setHudVisible(true);
    }, [buyResult]);

    useEffect(() => {
        if (!ws || !isConnected || contractId === null) return;

        let disposed = false;
        let unsubscribe = () => { };

        const handleUpdate = (message: Record<string, unknown>) => {
            if (message.msg_type !== 'proposal_open_contract') return;
            const update = message.proposal_open_contract as OpenContractUpdate | undefined;
            if (!update || update.contract_id !== contractId) return;

            const nextProfit = numeric(update.profit);
            if (nextProfit !== null) {
                setHudProfit(nextProfit > 0 ? nextProfit : -stakeRef.current);
            }

            const settled = !!update.is_sold || !!update.is_expired ||
                ['settled', 'sold', 'won', 'lost'].includes(update.status ?? '');
            if (settled && !disposed) {
                unsubscribeRef.current?.();
                unsubscribeRef.current = null;
                setContractId(null);
                settlementTimerRef.current = window.setTimeout(() => {
                    setHudVisible(false);
                    settlementTimerRef.current = null;
                    fadeTimerRef.current = window.setTimeout(() => {
                        setHudMounted(false);
                        setHudProfit(null);
                        stakeRef.current = 0;
                        fadeTimerRef.current = null;
                    }, 300);
                }, 2000);
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

    return { hudProfit, hudMounted, hudVisible };
}
