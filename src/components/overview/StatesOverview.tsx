import { CircleDollarSign, ListTodo, MoveDownLeft, MoveUpRight, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/Typoghraphy";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { FC, useEffect, useState } from "react";

export default function StatesOverview() {
  const { data: salesAgents } = api.salesAgents.getSalesAgents.useQuery()
  const { data: students } = api.users.getUsers.useQuery({ userType: "student" })
  const { data: operations } = api.salesOperations.getAll.useQuery()
  const { data: ordersTotal } = api.orders.getAll.useQuery()

  const totalSalaries = salesAgents?.salesAgents
    .map(agent => agent.salesAgent?.salary)
    .filter(i => i && i)
    .reduce((prev, curr) => {
      return prev + Number(curr)
    }, 0) || 0
  const totalStudents = students?.users.length || 0
  const progress = operations?.salesOperations
    ? operations?.salesOperations
      .filter(op => op.status === "completed")
      .length / operations?.salesOperations.length
    : 0
  const totalOrders = ordersTotal?.orders.length
  const totalIncome = ordersTotal?.orders
    ? ordersTotal.orders
      .map(order => order.amount)
      .reduce((prev, curr) => {
        return prev + Number(curr)
      }, 0) / 100
    : 0

  const states = [
    {
      title: "Budget",
      target: totalSalaries,
      style: "currency",
      icon: <CircleDollarSign className="text-background"></CircleDollarSign>,
      textColor: "text-red-500",
      backgroundColor: "bg-red-500",
    },
    {
      title: "Total students",
      target: totalStudents,
      icon: <Users2 className="text-background"></Users2>,
      style: "",
      textColor: "text-green-500",
      backgroundColor: "bg-green-500",
    },
    {
      title: "Tasks progress",
      target: progress,
      icon: <ListTodo className="text-background"></ListTodo>,
      style: "percent",
      progress: true,
      textColor: "text-orange-500",
      backgroundColor: "bg-orange-500",
    },
    {
      title: "Total Income",
      totalOrders,
      target: totalIncome,
      style: "currency",
      icon: <CircleDollarSign className="text-background"></CircleDollarSign>,
      textColor: "text-indigo-500",
      backgroundColor: "bg-indigo-500",
    },
  ];

  return (
    <>
      {states.map((state) => (
        <Card
          key={state.title}
          className="col-span-12 rounded-2xl bg-white p-2 shadow relative md:col-span-6 xl:col-span-3"
        >
          <CardHeader>
            <Typography variant="secondary" className="!text-xl xl:tracking-tighter xl:!text-lg">
              {state.title}
            </Typography>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Counter state={state}></Counter>
            {state.progress && (
              <Progress
                indicatorColor="bg-primary"
                className="bg-accent"
                value={state.target * 100}
              >
              </Progress>
            )}
            {state.totalOrders && (
              <Typography variant="bodyText" className="text-error">{state.totalOrders} Orders</Typography>
            )}
            <div
              className={`absolute right-4 top-4 rounded-full p-4 ${state.backgroundColor}`}
            >
              {state.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

interface CounterProps {
  state: {
    title: string;
    totalOrders?: number;
    target: number;
    style: string;
    icon: JSX.Element;
    textColor: string;
    backgroundColor: string;
    progress?: boolean
  }
}

const Counter: FC<CounterProps> = ({ state: {
  backgroundColor,
  icon,
  style,
  textColor,
  title,
  target,
  totalOrders
} }) => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const ticker = setInterval(() => {
      setCurrent(prev => {
        if (prev > target) {
          clearInterval(ticker)
          return target
        }
        return target / 1000 > 1 ? prev + 1000 : prev + 10
      })
    }, 20)
    console.log("inputs", {
      backgroundColor,
      icon,
      style,
      textColor,
      title,
      target,
      totalOrders
    });
    return () => clearInterval(ticker)
  }, [target])

  return (
    <Typography variant="bodyText" className={cn("!text-3xl font-bold", textColor)}>
      {current > 1000 ? new Intl.NumberFormat("en-US", { style, currency: "EGP", maximumFractionDigits: 2 }).format(current / 1000) : new Intl.NumberFormat("en-US", { style: style === "currency" ? "currency" : style === "percent" ? "percent" : undefined, currency: "EGP", maximumFractionDigits: 2 }).format(current)}
      {current > 1000 && "K"}
    </Typography>
  )
}
