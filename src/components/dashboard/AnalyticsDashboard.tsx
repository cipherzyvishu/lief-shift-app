"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  DatePicker, 
  Spin, 
  Alert,
  Typography,
  Space,
  Divider
} from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  LoginOutlined,
  BarChartOutlined 
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title: AntTitle } = Typography;

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// GraphQL queries
const GET_DAILY_STATS = gql`
  query GetDailyStats($date: String!) {
    dailyStats(date: $date) {
      date
      avgHours
      totalClockIns
      totalStaffActive
    }
  }
`;

const GET_WEEKLY_HOURS_PER_STAFF = gql`
  query GetWeeklyHoursPerStaff {
    weeklyHoursPerStaff {
      staffId
      staffName
      staffEmail
      totalHours
      shiftsCount
    }
  }
`;

interface DailyStats {
  date: string;
  avgHours: number;
  totalClockIns: number;
  totalStaffActive: number;
}

interface StaffWeeklyHours {
  staffId: string;
  staffName: string;
  staffEmail: string;
  totalHours: number;
  shiftsCount: number;
}

export default function AnalyticsDashboard() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Query for daily stats
  const { 
    data: dailyData, 
    loading: dailyLoading, 
    error: dailyError,
    refetch: refetchDaily 
  } = useQuery<{ dailyStats: DailyStats }>(GET_DAILY_STATS, {
    variables: { 
      date: selectedDate.format('YYYY-MM-DD') 
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network'
  });

  // Query for weekly staff hours
  const { 
    data: weeklyData, 
    loading: weeklyLoading, 
    error: weeklyError 
  } = useQuery<{ weeklyHoursPerStaff: StaffWeeklyHours[] }>(GET_WEEKLY_HOURS_PER_STAFF, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network'
  });

  // Refetch data when date changes
  useEffect(() => {
    refetchDaily();
  }, [selectedDate, refetchDaily]);

  // Prepare chart data for staff weekly hours
  const staffHoursChartData = useMemo(() => {
    if (!weeklyData?.weeklyHoursPerStaff) return null;

    const sortedData = weeklyData.weeklyHoursPerStaff.slice(0, 10); // Top 10 staff

    return {
      labels: sortedData.map(staff => staff.staffName || staff.staffEmail.split('@')[0]),
      datasets: [
        {
          label: 'Weekly Hours',
          data: sortedData.map(staff => staff.totalHours),
          backgroundColor: 'rgba(24, 144, 255, 0.8)',
          borderColor: 'rgba(24, 144, 255, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Number of Shifts',
          data: sortedData.map(staff => staff.shiftsCount),
          backgroundColor: 'rgba(82, 196, 26, 0.8)',
          borderColor: 'rgba(82, 196, 26, 1)',
          borderWidth: 1,
          borderRadius: 4,
        }
      ],
    };
  }, [weeklyData]);

  // Prepare doughnut chart data for staff hours distribution
  const hoursDistributionData = useMemo(() => {
    if (!weeklyData?.weeklyHoursPerStaff) return null;

    const data = weeklyData.weeklyHoursPerStaff.slice(0, 6); // Top 6 staff
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'
    ];

    return {
      labels: data.map(staff => staff.staffName || staff.staffEmail.split('@')[0]),
      datasets: [
        {
          label: 'Hours Worked',
          data: data.map(staff => staff.totalHours),
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        }
      ],
    };
  }, [weeklyData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Staff Weekly Performance (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Hours Distribution (Top Staff)',
      },
    }
  };

  // Handle date change
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!weeklyData?.weeklyHoursPerStaff) return null;

    const totalStaff = weeklyData.weeklyHoursPerStaff.length;
    const totalHours = weeklyData.weeklyHoursPerStaff.reduce((sum, staff) => sum + staff.totalHours, 0);
    const totalShifts = weeklyData.weeklyHoursPerStaff.reduce((sum, staff) => sum + staff.shiftsCount, 0);
    const avgHoursPerStaff = totalStaff > 0 ? totalHours / totalStaff : 0;

    return {
      totalStaff,
      totalHours,
      totalShifts,
      avgHoursPerStaff
    };
  }, [weeklyData]);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <AntTitle level={2}>
            <BarChartOutlined /> Analytics Dashboard
          </AntTitle>
        </Col>

        {/* Date Selector for Daily Stats */}
        <Col span={24}>
          <Card>
            <Space>
              <span style={{ fontWeight: 'bold' }}>Select Date for Daily Analysis:</span>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                allowClear={false}
                disabledDate={(date) => date && date.isAfter(dayjs())}
              />
            </Space>
          </Card>
        </Col>

        {/* Daily Statistics Cards */}
        <Col span={24}>
          <AntTitle level={4}>Daily Statistics - {selectedDate.format('MMMM D, YYYY')}</AntTitle>
          
          {dailyError && (
            <Alert
              message="Error Loading Daily Stats"
              description={dailyError.message}
              type="error"
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={dailyLoading}>
                  <Statistic
                    title="Average Hours Worked"
                    value={dailyData?.dailyStats.avgHours || 0}
                    precision={1}
                    suffix="hrs"
                    prefix={<ClockCircleOutlined />}
                  />
                </Spin>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={dailyLoading}>
                  <Statistic
                    title="Total Clock-ins"
                    value={dailyData?.dailyStats.totalClockIns || 0}
                    prefix={<LoginOutlined />}
                  />
                </Spin>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={dailyLoading}>
                  <Statistic
                    title="Active Staff Members"
                    value={dailyData?.dailyStats.totalStaffActive || 0}
                    prefix={<UserOutlined />}
                  />
                </Spin>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={dailyLoading}>
                  <Statistic
                    title="Efficiency Rate"
                    value={dailyData?.dailyStats.avgHours ? 
                      Math.min(100, (dailyData.dailyStats.avgHours / 8) * 100) : 0}
                    precision={0}
                    suffix="%"
                    prefix={<BarChartOutlined />}
                  />
                </Spin>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Divider />
        </Col>

        {/* Weekly Summary Statistics */}
        <Col span={24}>
          <AntTitle level={4}>Weekly Summary (Last 7 Days)</AntTitle>
          
          {weeklyError && (
            <Alert
              message="Error Loading Weekly Stats"
              description={weeklyError.message}
              type="error"
              style={{ marginBottom: 16 }}
            />
          )}

          {summaryStats && (
            <Row gutter={16}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Active Staff"
                    value={summaryStats.totalStaff}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Hours Worked"
                    value={summaryStats.totalHours}
                    precision={1}
                    suffix="hrs"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Shifts Completed"
                    value={summaryStats.totalShifts}
                    prefix={<LoginOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Average Hours per Staff"
                    value={summaryStats.avgHoursPerStaff}
                    precision={1}
                    suffix="hrs"
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Col>

        {/* Charts Section */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Card title="Staff Performance Analysis" style={{ height: '500px' }}>
                <Spin spinning={weeklyLoading}>
                  {staffHoursChartData ? (
                    <div style={{ height: '400px' }}>
                      <Bar data={staffHoursChartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      No data available for the selected period
                    </div>
                  )}
                </Spin>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Hours Distribution" style={{ height: '500px' }}>
                <Spin spinning={weeklyLoading}>
                  {hoursDistributionData ? (
                    <div style={{ height: '400px' }}>
                      <Doughnut data={hoursDistributionData} options={doughnutOptions} />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      No data available
                    </div>
                  )}
                </Spin>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Staff Details Table */}
        <Col span={24}>
          <Card title="Individual Staff Performance (Last 7 Days)">
            <Spin spinning={weeklyLoading}>
              {weeklyData?.weeklyHoursPerStaff && weeklyData.weeklyHoursPerStaff.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {weeklyData.weeklyHoursPerStaff.map((staff) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={staff.staffId}>
                      <Card size="small">
                        <Statistic
                          title={staff.staffName || staff.staffEmail.split('@')[0]}
                          value={staff.totalHours}
                          precision={1}
                          suffix="hrs"
                          prefix={<UserOutlined />}
                        />
                        <div style={{ marginTop: 8, color: '#666' }}>
                          {staff.shiftsCount} shift{staff.shiftsCount !== 1 ? 's' : ''} completed
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  No staff data available for the last 7 days
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
