import { CircleDollarSign, ListTodo, Users2 } from "lucide-react";
import { api } from "@/lib/api";
import { getDifferenceMargin, getLastWeekDate } from "@/lib/utils";
import { useEffect, useState } from "react";
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
  const salesAgentsQuery = api.salesAgents.getSalesAgents.useQuery(undefined, {
    enabled: false
  })
  const studentsQuery = api.users.getUsers.useQuery({ userType: "student" }, {
    enabled: false
  })
  const operationsQuery = api.salesOperations.getAll.useQuery(undefined, {
    enabled: false
  })
  const ordersQuery = api.orders.getAll.useQuery(undefined, {
    enabled: false
  })

  const [budget, setBudget] = useState<StateOverview>({
    title: "Budget",
    target: 0,
    style: "currency",
    icon: <CircleDollarSign className="text-background"></CircleDollarSign>,
    textColor: "text-red-500",
    backgroundColor: "bg-red-500",
    sinceLastWeek: 0,
    isLiability: true
  })
  const [students, setStudents] = useState<StateOverview>({
    title: "Total students",
    target: 0,
    style: "",
    icon: <Users2 className="text-background"></Users2>,
    textColor: "text-green-500",
    backgroundColor: "bg-green-500",
    sinceLastWeek: 0,
    isLiability: false
  })
  const [tasks, setTasks] = useState<StateOverview>({
    title: "Tasks progress",
    target: 0,
    style: "percent",
    icon: <ListTodo className="text-background"></ListTodo>,
    progress: true,
    textColor: "text-orange-500",
    backgroundColor: "bg-orange-500",
    sinceLastWeek: 0,
    isLiability: false,
  })
  const [income, setIncome] = useState<StateOverview>({
    title: "Total Income",
    target: 0,
    style: "currency",
    icon: <CircleDollarSign className="text-background"></CircleDollarSign>,
    textColor: "text-indigo-500",
    backgroundColor: "bg-indigo-500",
    sinceLastWeek: 0,
    isLiability: false,
  })

  const dataLoader = () => {
    salesAgentsQuery.refetch()
      .then(({ data }) => {
        const {
          differenceMargin: salariesSinceLastWeek,
          total: currentTotalSalaries
        } = data?.salesAgents.map
            ? getDifferenceMargin(data?.salesAgents, "salary")
            : { differenceMargin: 0, total: 0 }

        setBudget(prev => ({
          ...prev,
          target: currentTotalSalaries,
          sinceLastWeek: salariesSinceLastWeek,
        }))
      })

    studentsQuery.refetch()
      .then(({ data }) => {
        const totalStudents = data?.users.length || 0
        const lastWeekStudents = data?.users
          .filter(a => new Date(a.createdAt) > getLastWeekDate()).length || 0
        const studentsSinceLastWeek = (totalStudents - lastWeekStudents) / lastWeekStudents

        setStudents(prev => ({
          ...prev,
          target: totalStudents,
          sinceLastWeek: studentsSinceLastWeek,
        }))
      })

    operationsQuery.refetch()
      .then(({ data }) => {
        const progress = data?.salesOperations
          ? data?.salesOperations
            .filter(op => op.status === "completed")
            .length / data?.salesOperations.length
          : 0
        const lastWeekProgress = data?.salesOperations
          ? data?.salesOperations
            .filter(op => op.status === "completed" && new Date(op.updatedAt) < getLastWeekDate())
            .length / data?.salesOperations
              .filter(op => new Date(op.createdAt) < getLastWeekDate()).length
          : 0
        const progressSinceLastWeek = (progress - lastWeekProgress) * 100

        setTasks(prev => ({
          ...prev,
          target: progress,
          sinceLastWeek: progressSinceLastWeek,
        }))
      })

    ordersQuery.refetch()
      .then(({ data }) => {
        const totalOrders = data?.orders.length
        const {
          differenceMargin: totalIncomeSinceLastWeek,
          total: totalIncome
        } = data?.orders
            ? getDifferenceMargin(data.orders, "amount")
            : { differenceMargin: 0, total: 0 }

        setIncome(prev => ({
          ...prev,
          target: totalIncome,
          sinceLastWeek: totalIncomeSinceLastWeek,
          totalOrders,
        }))
      })
  }

  useEffect(dataLoader, [])

  return (
    <>
      <StateCard state={budget} />
      <StateCard state={students} />
      <StateCard state={tasks} />
      <StateCard state={income} />
    </>
  );
}
