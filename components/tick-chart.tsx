'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { TickPoint } from '@deriv/core';

interface TickChartProps {
  data: TickPoint[];
  symbol?: string;
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

export function TickChart({ data, symbol }: TickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
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

    chartRef.current = chart;
    seriesRef.current = series;

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
    const chart = chartRef.current;
    if (!series || !chart) return;

    const chartData: AreaData<UTCTimestamp>[] = data.map(point => ({
      time: point.time as UTCTimestamp,
      value: point.value,
    }));
    const symbolChanged = previousSymbolRef.current !== symbol;
    previousSymbolRef.current = symbol;

    series.setData(chartData);
    if (symbolChanged || chartData.length <= 1) {
      chart.timeScale().fitContent();
    } else {
      chart.timeScale().scrollToRealTime();
    }
  }, [data, symbol]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      role="img"
      aria-label={symbol ? `Live price chart for ${symbol}` : 'Live price chart'}
    />
  );
}
