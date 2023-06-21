import { format } from "date-fns";
import PropTypes from "prop-types";
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
import { SeverityPill } from "@/components/SeverityPill";

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

export const LatestOrdersOverview = (props: { orders: Order[]; sx: any }) => {
  const { orders = [], sx } = props;

  return (
    <Card sx={sx} className="col-span-12 lg:col-span-8">
      <CssBaseline />
      <CardHeader title="Latest Orders" />
      <Box
        component="div"
        className="overflow-y-scroll transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-rounded-lg scrollbar-thumb-primary/50"
      >
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
      </Box>
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

LatestOrdersOverview.prototype = {
  orders: PropTypes.array,
  sx: PropTypes.object,
};
