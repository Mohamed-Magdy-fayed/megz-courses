import { format } from "date-fns";
import ArrowRightIcon from "@heroicons/react/24/solid/ArrowRightIcon";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CssBaseline,
} from "@mui/material";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { SxProps, Theme } from "@mui/material/styles";
import Scrollbar from "../Scrollbar";

const statusMap: {
  pending: "warning";
  delivered: "success";
  refunded: "error";
} = {
  pending: "warning",
  delivered: "success",
  refunded: "error",
};

interface Order {
  id: string;
  ref: string;
  amount: number;
  customer: {
    name: string;
  };
  createdAt: number;
  status: string;
}

export const LatestOrdersOverview = (props: {
  orders: Order[];
  sx: SxProps<Theme>;
}) => {
  const { orders = [], sx } = props;

  return (
    <Card sx={sx} className="col-span-12 lg:col-span-8">
      <CssBaseline />
      <CardHeader title="Latest Orders" />
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell sortDirection="desc">Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const createdAt = format(order.createdAt, "dd/MM/yyyy");
                const orderStatus = order.status as keyof typeof statusMap;

                return (
                  <TableRow hover key={order.id}>
                    <TableCell>{order.ref}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{createdAt}</TableCell>
                    <TableCell>
                      <SeverityPill
                        color={statusMap[orderStatus]}
                        label={orderStatus}
                      ></SeverityPill>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>{" "}
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
};
