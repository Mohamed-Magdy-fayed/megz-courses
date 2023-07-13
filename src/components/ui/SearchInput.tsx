import {
  Box,
  Icon,
  InputAdornment,
  InputBase,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

export const SearchInput = () => (
  <Box component="div" className="p-4">
    <InputBase
      defaultValue=""
      fullWidth
      placeholder="Search Students"
      className="hover:shadow-0 rounded-full p-2 text-sm font-medium leading-6 outline-none outline-1 outline-offset-0 outline-slate-300 focus-within:!bg-white focus-within:outline-2 focus-within:outline-primary hover:bg-slate-100"
      startAdornment={
        <InputAdornment position="start">
          <Icon color="action">
            <SearchOutlinedIcon />
          </Icon>
        </InputAdornment>
      }
    />
  </Box>
);
