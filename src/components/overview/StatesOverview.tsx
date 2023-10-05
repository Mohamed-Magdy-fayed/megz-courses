import { CircleDollarSign, ListTodo, MoveDownLeft, MoveUpRight, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/Typoghraphy";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
      value: totalSalaries,
      marker: { after: false, value: "$" },
      difference: { increased: true, value: 12 },
      icon: <CircleDollarSign className="text-background"></CircleDollarSign>,
      textColor: "text-red-500",
      backgroundColor: "bg-red-500",
    },
    {
      title: "Total students",
      value: totalStudents,
      difference: { increased: false, value: 16 },
      icon: <Users2 className="text-background"></Users2>,
      textColor: "text-green-500",
      backgroundColor: "bg-green-500",
    },
    {
      title: "Tasks progress",
      value: Number((progress * 100).toFixed(2)),
      icon: <ListTodo className="text-background"></ListTodo>,
      marker: { after: true, value: "%" },
      progress: true,
      textColor: "text-orange-500",
      backgroundColor: "bg-orange-500",
    },
    {
      title: "Total Income",
      totalOrders,
      value: Number(totalIncome.toFixed()),
      marker: { after: false, value: "$" },
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
            <Counter state={state} target={state.value}></Counter>
            {state.difference && (
              <div className="flex items-center gap-2">
                <Typography
                  className={
                    state.difference.increased
                      ? "text-success"
                      : "text-error"
                  }
                >
                  {state.difference.increased ? (
                    <MoveUpRight></MoveUpRight>
                  ) : (
                    <MoveDownLeft></MoveDownLeft>
                  )}{" "}
                  {state.difference.value}%
                </Typography>{" "}
                <Typography variant={"bodyText"} className="">since last month</Typography>
              </div>
            )}
            {state.progress && (
              <Progress
                indicatorColor="bg-primary"
                className="bg-accent"
                value={state.value}
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

const Counter = ({ state, target }: { state: any, target: number }) => {
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

    return () => clearInterval(ticker)
  }, [target])

  return (
    <Typography variant="bodyText" className={cn("!text-3xl font-bold", state.textColor)}>
      {!state.marker?.after && state.marker?.value}
      {current > 1000 ? current / 1000 : current}
      {current > 1000 ? "k" : ""}
      {state.marker?.after && state.marker?.value}
    </Typography>
  )
}
