'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BuyResult, DerivWS, TickPoint } from '@deriv/core';

interface ContractTick {
    epoch: number;
    tick: number;
}

interface OpenContractUpdate {
    contract_id: number;
    profit?: number | string;
    is_sold?: number;
    is_expired?: number;
    status?: string;
    entry_spot?: number;
    entry_tick_time?: number;
    date_start?: number;
    tick_stream?: ContractTick[];
    current_spot?: number;
    current_spot_time?: number;
}

export interface ChartEntry {
    time: number;
    value: number;
}

export interface ChartPayout {
    amount: number;
    isWin: boolean;
}

interface UseTradeChartTrackingReturn {
    activeTail: TickPoint[];
    tailColor: string;
    entry: ChartEntry | null;
    payout: ChartPayout | null;
    dismissResult: () => void;
}

const BLUE = '#2563eb';
const GREEN = '#16a34a';
const RED = '#dc2626';

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
    const [activeTail, setActiveTail] = useState<TickPoint[]>([]);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const [profit, setProfit] = useState(0);
    const [entry, setEntry] = useState<ChartEntry | null>(null);
    const entryRef = useRef<ChartEntry | null>(null);
    const [isSettled, setIsSettled] = useState(false);
    const [payout, setPayout] = useState<ChartPayout | null>(null);

    useEffect(() => {
        if (!buyResult) return;
        setContractId(buyResult.contractId);
        setActiveTail([]);
        setProfit(0);
        entryRef.current = null;
        setEntry(null);
        setIsSettled(false);
        setPayout(null);
    }, [buyResult]);

    useEffect(() => {
        if (!ws || !isConnected || contractId === null) return;

        let disposed = false;
        let unsubscribe = () => { };

        const handleUpdate = (message: Record<string, unknown>) => {
            if (message.msg_type !== 'proposal_open_contract') return;
            const update = message.proposal_open_contract as OpenContractUpdate | undefined;
            if (!update || update.contract_id !== contractId) return;

            const entryValue = numeric(update.entry_spot);
            const entryTime = numeric(update.entry_tick_time) ?? numeric(update.date_start);
            if (entryValue !== null && entryTime !== null) {
                const nextEntry = { time: entryTime, value: entryValue };
                entryRef.current = nextEntry;
                setEntry(nextEntry);
            }

            const nextProfit = numeric(update.profit);
            if (nextProfit !== null) setProfit(nextProfit);

            const stream = (update.tick_stream ?? [])
                .map(point => ({ time: point.epoch, value: point.tick }))
                .filter(point => Number.isFinite(point.time) && Number.isFinite(point.value));
            const currentSpot = numeric(update.current_spot);
            const currentTime = numeric(update.current_spot_time);
            const points = currentSpot !== null && currentTime !== null
                ? [...stream, { time: currentTime, value: currentSpot }]
                : stream;
            const continuousPoints = entryRef.current ? [entryRef.current, ...points] : points;
            const unique = new Map(continuousPoints.map(point => [point.time, point]));
            setActiveTail(Array.from(unique.values()).sort((a, b) => a.time - b.time));

            const settled = !!update.is_sold || !!update.is_expired ||
                ['settled', 'sold', 'won', 'lost'].includes(update.status ?? '');
            if (settled && !disposed) {
                setIsSettled(true);
                setPayout({ amount: Math.abs(nextProfit ?? 0), isWin: (nextProfit ?? 0) > 0 });
                unsubscribeRef.current?.();
                unsubscribeRef.current = null;
                setContractId(null);
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

    const dismissResult = useCallback(() => {
        if (!isSettled) return;
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
        setContractId(null);
        setActiveTail([]);
        entryRef.current = null;
        setEntry(null);
        setPayout(null);
        setProfit(0);
    }, [isSettled]);

    return {
        activeTail,
        tailColor: isSettled ? BLUE : profit > 0 ? GREEN : RED,
        entry,
        payout,
        dismissResult,
    };
}

export { BLUE, GREEN, RED };
