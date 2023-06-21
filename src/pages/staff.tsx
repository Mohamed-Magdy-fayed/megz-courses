import Head from "next/head";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
  Box,
  Button,
  Container,
  Pagination,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StaffMemberCard } from "src/sections/staff/StaffMemberCard";
import { StaffSearch } from "src/sections/staff/StaffSearch";

export interface StaffMember {
  id: string;
  createdAt: string;
  jobDescription: string;
  image: string;
  name: string;
  tasksDone: string;
}

const staff: StaffMember[] = [
  {
    id: "2569ce0d517a7f06d3ea1f24",
    createdAt: "27/03/2019",
    jobDescription:
      "A Billing Manager has many responsibilities, such as planning the billing, accounts receivable, and collections operations of a department.",
    image: "/avatars/avatar-fran-perez.png",
    name: "Ann Fran",
    tasksDone: "594",
  },
  {
    id: "ed2b900870ceba72d203ec15",
    createdAt: "31/03/2019",
    jobDescription:
      "The Accounts Payable Specialist is part of the accounting team and oversees an organization’s day-to-day financial transactions, including accounts payables, corporate credit card reconciliations and other specialized tasks.",
    image: "/avatars/avatar-miron-vitold.png",
    name: "Vitold Carson",
    tasksDone: "625",
  },
  {
    id: "a033e38768c82fca90df3db7",
    createdAt: "03/04/2019",
    jobDescription:
      "A Medical Biller takes the claims dictated by a Medical Coder and submits them to a patient’s insurance company. They then make sure patients are adequately compensated and billed correctly for timely payments to be made on behalf of each party.",
    image: "/avatars/avatar-anika-visser.png",
    name: "Anika Miron",
    tasksDone: "857",
  },
  {
    id: "1efecb2bf6a51def9869ab0f",
    createdAt: "04/04/2019",
    jobDescription:
      "Tax preparers obtain the client’s financial information in order to estimate tax payments and returns. They fill in tax reports and advise clients on tax management strategies.  ",
    image: "/avatars/avatar-omar-darboe.png",
    name: "Omar Danai",
    tasksDone: "406",
  },
  {
    id: "1ed68149f65fbc6089b5fd07",
    createdAt: "04/04/2019",
    jobDescription:
      "Cost analysts study corporate expenses and create reports for management. One common industry for cost analysts is manufacturing where they are needed to audit production costs.",
    image: "/avatars/avatar-iulia-albu.png",
    name: "Iulia Gottfried",
    tasksDone: "835",
  },
  {
    id: "5dab321376eff6177407e887",
    createdAt: "04/04/2019",
    jobDescription:
      "Payroll accountants are in charge of payroll operations in organizations. They usually report to the Director of Finance. ",
    image: "/avatars/avatar-penjani-inyene.png",
    name: "Penjani Visser",
    tasksDone: "835",
  },
];

const Page = () => (
  <DashboardLayout>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Staff</Typography>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Button
                  color="inherit"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowUpOnSquareIcon />
                    </SvgIcon>
                  }
                >
                  Import
                </Button>
                <Button
                  color="inherit"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowDownOnSquareIcon />
                    </SvgIcon>
                  }
                >
                  Export
                </Button>
              </Stack>
            </Stack>
            <div>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                className="bg-primary"
                variant="contained"
                color="primary"
              >
                Add
              </Button>
            </div>
          </Stack>
          <StaffSearch />
          <Grid container spacing={3}>
            {staff.map((staffMember) => (
              <Grid xs={12} md={6} lg={4} key={staffMember.id}>
                <StaffMemberCard staffMember={staffMember} />
              </Grid>
            ))}
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination count={3} size="small" />
          </Box>
        </Stack>
      </Container>
    </Box>
  </DashboardLayout>
);

export default Page;
