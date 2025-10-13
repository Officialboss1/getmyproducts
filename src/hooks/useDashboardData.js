import { useState, useEffect, useCallback } from 'react';
import apiSvc, { referralsAPI } from '../../src/api/services/api';

// Helper to safely parse numbers
const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
};

const extractQty = (sale) =>
  toNumber(
    sale?.quantity_sold ??
      sale?.units ??
      sale?.quantity ??
      sale?.total_units ??
      0
  );

export default function useDashboardData(user) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Sales endpoint is proxied through service helpers when present
      const salesPromise =
        user && user.role === 'salesperson'
          ? apiSvc.sales.getSales({ userId: user._id })
          : apiSvc.sales.getSales();

      const [
        dailyRes,
        weeklyRes,
        monthlyRes,
        targetsRes,
        salesRes,
        competitionsRes,
      ] = await Promise.all([
        apiSvc.analytics.getProgress('', 'daily'),
        apiSvc.analytics.getProgress('', 'weekly'),
        apiSvc.analytics.getProgress('', 'monthly'),
        apiSvc.targets.getTargets(),
        salesPromise,
        apiSvc.competitions.getCompetitions(),
      ]);

      // referrals: try stats, fallback to list count
      let referralStats = null;
      try {
        const r = await referralsAPI.getReferralStats();
        referralStats = r?.data ?? null;
      } catch {
        try {
          const list = (await referralsAPI.getMyReferrals())?.data ?? [];
          const activeCount = list.filter(
            (r) => (r.status || '').toLowerCase() !== 'completed'
          ).length;
          referralStats = { activeReferrals: activeCount };
        } catch {
          referralStats = null;
        }
      }

      const salesList = salesRes?.data?.sales || salesRes?.data || [];

      // compute numeric targets
      const targets = targetsRes?.data || {};
      const dailyTarget = toNumber(targets.daily ?? 30);
      const weeklyTarget = toNumber(targets.weekly ?? 210);
      const monthlyTarget = toNumber(targets.monthly ?? 900);

      const dailyUnits = toNumber(dailyRes?.data?.totalUnits ?? 0);

      const weeklyUnits =
        Array.isArray(salesList) && salesList.length > 0
          ? salesList.reduce((s, sale) => s + extractQty(sale), 0)
          : toNumber(weeklyRes?.data?.totalUnits ?? 0);

      const monthlyUnits =
        toNumber(monthlyRes?.data?.totalUnits ?? 0) ||
        (Array.isArray(salesList)
          ? salesList.reduce((s, sale) => s + extractQty(sale), 0)
          : 0);

      const monthlyPercentageBackend =
        monthlyRes?.data?.percentage !== undefined
          ? toNumber(monthlyRes.data.percentage)
          : undefined;

      const computed = {
        progress: {
          daily: dailyRes?.data ?? {},
          weekly: weeklyRes?.data ?? {},
          monthly: monthlyRes?.data ?? {},
        },
        targets,
        sales: salesList,
        competitions: competitionsRes?.data || [],
        referralStats,
        derived: {
          dailyProgress: {
            current: dailyUnits,
            target: dailyTarget,
            percentage: dailyTarget ? (dailyUnits / dailyTarget) * 100 : 0,
          },
          weeklyProgress: {
            current: weeklyUnits,
            target: weeklyTarget,
            percentage: weeklyTarget ? (weeklyUnits / weeklyTarget) * 100 : 0,
          },
          monthlyProgress: {
            current: monthlyUnits,
            target: monthlyTarget,
            percentage:
              monthlyPercentageBackend ??
              (monthlyTarget ? (monthlyUnits / monthlyTarget) * 100 : 0),
          },
        },
      };

      setData(computed);
    } catch (err) {
      console.error('Error fetching dashboard data (hook):', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refresh: fetchData,
  };
}



