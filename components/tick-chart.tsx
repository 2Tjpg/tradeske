'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  LineSeries,
  createChart,
  createSeriesMarkers,
  type AreaData,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { TickPoint } from '@deriv/core';

interface ChartMarker {
  time: number;
  value: number;
}

interface TickChartProps {
  data: TickPoint[];
  symbol?: string;
  activeTail?: TickPoint[];
  tailColor?: string;
  entry?: ChartMarker | null;
  payout?: { amount: number; isWin: boolean } | null;
  onDismissPayout?: () => void;
}

const LIGHT_THEME = {
  background: '#ffffff',
  text: '#737373',
  grid: 'rgba(10, 10, 10, 0.08)',
  border: 'rgba(10, 10, 10, 0.14)',
};

const DARK_THEME = {
  background: '#181c25',
  text: '#a3a3a3',
  grid: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.14)',
};

export function TickChart({
  data,
  symbol,
  activeTail = [],
  tailColor = '#dc2626',
  entry = null,
  payout = null,
  onDismissPayout,
}: TickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const tailSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const entryLineRef = useRef<IPriceLine | null>(null);
  const markersRef = useRef<{ setMarkers: (markers: Array<{ time: UTCTimestamp; position: 'aboveBar'; color: string; shape: 'circle'; text: string }>) => void } | null>(null);
  const previousSymbolRef = useRef(symbol);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: LIGHT_THEME.background },
        textColor: LIGHT_THEME.text,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: LIGHT_THEME.grid },
        horzLines: { color: LIGHT_THEME.grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: LIGHT_THEME.border,
        scaleMargins: { top: 0.12, bottom: 0.18 },
      },
      timeScale: {
        borderColor: LIGHT_THEME.border,
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 6,
        barSpacing: 8,
        fixLeftEdge: true,
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#2563eb',
      lineWidth: 2,
      topColor: 'rgba(37, 99, 235, 0.45)',
      bottomColor: 'rgba(37, 99, 235, 0.02)',
      priceLineColor: '#2563eb',
      crosshairMarkerBorderColor: '#2563eb',
      crosshairMarkerBackgroundColor: '#ffffff',
    });
    const tailSeries = chart.addSeries(LineSeries, {
      color: '#dc2626',
      lineWidth: 3,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;
    tailSeriesRef.current = tailSeries;
    markersRef.current = createSeriesMarkers(series, []);

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (entryLineRef.current && seriesRef.current) {
        seriesRef.current.removePriceLine(entryLineRef.current);
      }
      entryLineRef.current = null;
      markersRef.current?.setMarkers([]);
      markersRef.current = null;
      tailSeriesRef.current = null;
      seriesRef.current = null;
      chartRef.current = null;
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const colors = resolvedTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: { borderColor: colors.border },
      timeScale: { borderColor: colors.border },
    });
  }, [resolvedTheme]);

  useEffect(() => {
    const series = seriesRef.current;
    const tailSeries = tailSeriesRef.current;
    const chart = chartRef.current;
    if (!series || !tailSeries || !chart) return;

    const chartData: AreaData<UTCTimestamp>[] = data.map(point => ({
      time: point.time as UTCTimestamp,
      value: point.value,
    }));
    const symbolChanged = previousSymbolRef.current !== symbol;
    previousSymbolRef.current = symbol;

    series.setData(chartData);
    tailSeries.setData(
      activeTail.map(point => ({
        time: point.time as UTCTimestamp,
        value: point.value,
      }))
    );
    tailSeries.applyOptions({ color: tailColor });

    if (entryLineRef.current) {
      series.removePriceLine(entryLineRef.current);
    }
    entryLineRef.current = null;
    if (entry) {
      entryLineRef.current = series.createPriceLine({
        price: entry.value,
        color: '#f59e0b',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Entry',
      });
      markersRef.current?.setMarkers([{
        time: entry.time as UTCTimestamp,
        position: 'aboveBar',
        color: '#f59e0b',
        shape: 'circle',
        text: 'Entry',
      }]);
    } else {
      markersRef.current?.setMarkers([]);
    }

    if (symbolChanged || chartData.length <= 1) {
      chart.timeScale().fitContent();
    } else {
      chart.timeScale().scrollToRealTime();
    }
  }, [activeTail, data, entry, symbol, tailColor]);

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="img"
        aria-label={symbol ? `Live price chart for ${symbol}` : 'Live price chart'}
      />
      {payout && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/10">
          <div className="flex items-center gap-2 rounded-md bg-background/95 px-4 py-3 shadow-lg ring-1 ring-border">
            <span className={`text-2xl font-bold ${payout.isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
              Payout {payout.isWin ? '+' : '-'}{payout.amount.toFixed(2)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDismissPayout}
              aria-label="Dismiss payout result"
              title="Dismiss payout result"
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
