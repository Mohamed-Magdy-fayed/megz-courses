import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { CircleDollarSign, ListTodo, Users2 } from "lucide-react";

import StateCard from "./StateCard";

export type StateOverview = {
  title: string
  target: number
  style: "currency" | "percent" | ""
  icon: JSX.Element
  textColor: string
  backgroundColor: string
  sinceLastWeek: number
  isLiability: boolean
  progress?: boolean
  totalOrders?: number
}

export default function StatesOverview() {
  const spendingsQuery = api.zoomGroups.getSpendings.useQuery(undefined, { enabled: false })
  const studentsQuery = api.users.getStudentsState.useQuery(undefined, { enabled: false })
  const leadsQuery = api.leads.getConversionRate.useQuery(undefined, { enabled: false })
  const ordersQuery = api.orders.getSalesTotal.useQuery(undefined, { enabled: false })

  const [states, setStates] = useState<StateOverview[]>([
    {
      title: "Budget",
      target: 0,
      style: "currency",
      icon: <CircleDollarSign className="text-background" />,
      textColor: "text-red-500",
      backgroundColor: "bg-red-500",
      sinceLastWeek: 0,
      isLiability: true,
    },
    {
      title: "Total students",
      target: 0,
      style: "",
      icon: <Users2 className="text-background" />,
      textColor: "text-green-500",
      backgroundColor: "bg-green-500",
      sinceLastWeek: 0,
      isLiability: false,
    },
    {
      title: "Convertion Rate",
      target: 0,
      style: "percent",
      icon: <ListTodo className="text-background" />,
      textColor: "text-orange-500",
      backgroundColor: "bg-orange-500",
      sinceLastWeek: 0,
      isLiability: false,
      progress: true,
    },
    {
      title: "Total Income",
      target: 0,
      style: "currency",
      icon: <CircleDollarSign className="text-background" />,
      textColor: "text-indigo-500",
      backgroundColor: "bg-indigo-500",
      sinceLastWeek: 0,
      isLiability: false,
      totalOrders: 0,
    },
  ]);

  useEffect(() => {
    Promise.all([
      spendingsQuery.refetch(),
      studentsQuery.refetch(),
      leadsQuery.refetch(),
      ordersQuery.refetch(),
    ]).then(([spendings, students, leads, orders]) => {
      const data = [
        {
          ...states[0]!,
          target: spendings.data?.currentBudget || 0,
          sinceLastWeek: spendings.data?.change || 0,
        },
        {
          ...states[1]!,
          target: students.data?.currentCount || 0,
          sinceLastWeek: students.data?.change || 0,
        },
        {
          ...states[2]!,
          target: leads.data?.conversionRate || 0,
          sinceLastWeek: leads.data?.change || 0,
        },
        {
          ...states[3]!,
          target: orders.data?.totalIncome || 0,
          sinceLastWeek: orders.data?.change || 0,
          totalOrders: orders.data?.totalOrders || 0,
        },
      ];

      setStates(data);
    });
  }, []);

  return (
    <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {states.map((state, idx) => (
        <StateCard key={idx} state={state} />
      ))}
    </div>
  );
}
