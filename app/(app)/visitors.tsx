import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { VisitorListCard } from '@/src/components/visitors/VisitorListCard';
import { SummaryCard } from '@/src/components/dashboard/SummaryCard';
import VisitorDistributionChart from '@/src/components/dashboard/VisitorDistributionChart';
import { Users, Building, ShieldOff, Globe } from 'lucide-react-native';
import { visitorService } from '@/src/services/visitorService';

export default function VisitorsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    internal: 0,
    external: 0,
    blocked: 0,
    cancelled: 0,
    trends: {
      total: "+0%",
      internal: "+0%",
      external: "+0%",
      blocked: "+0%",
      cancelled: "+0%",
    }
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const data = await visitorService.getMonthlyVisitorStats();
      setStats(prev => ({ ...prev, ...data }));
    };
    fetchCounts();
  }, []);

  return (
    <ScrollView 
      className="flex-1 bg-transparent w-full"
      contentContainerClassName="p-4 md:p-6 gap-4 md:gap-6"
    >
      <View className="flex-col lg:flex-row gap-5 w-full">
        {/* Left Side: Summary Cards */}
        <View className="flex-col gap-5 w-full lg:w-[40%] xl:w-1/2">
          {/* Row 1 */}
          <View className="flex-row flex-wrap xl:flex-nowrap gap-5 w-full">
            <SummaryCard
              title="Toplam Ziyaretçiler"
              value={stats.total.toString()}
              icon={Users}
              trendValue={stats.trends.total}
              trendLabel="Bu Ay"
              variant="primary"
            />
            <SummaryCard
              title="Kurum İçi Ziyaretçiler"
              value={stats.internal.toString()}
              icon={Building}
              trendValue={stats.trends.internal}
              trendLabel="Bu Ay"
              variant="default"
            />
          </View>

          {/* Row 2 */}
          <View className="flex-row flex-wrap xl:flex-nowrap gap-5 w-full">
            <SummaryCard
              title="Engellenen Ziyaretçiler"
              value={stats.blocked.toString()}
              icon={ShieldOff}
              trendValue={stats.trends.blocked}
              trendLabel="Bu Ay"
              variant="default"
            />
            <SummaryCard
              title="Kurum Dışı Ziyaretçiler"
              value={stats.external.toString()}
              icon={Globe}
              trendValue={stats.trends.external}
              trendLabel="Bu Ay"
              variant="default"
            />
          </View>
        </View>

        {/* Right Side: Visitor Distribution Chart */}
        <View className="flex-col flex-1 w-full">
          <VisitorDistributionChart stats={stats} />
        </View>
      </View>

      <VisitorListCard onAddVisitor={() => router.push('/visitors/add')} />
    </ScrollView>
  );
}
