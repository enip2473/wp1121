"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';
import { formatName } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LeftBar() {
    const searchParams = useSearchParams()
    const username = searchParams.get('username') || ''
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: "20%",
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: "20%", boxSizing: 'border-box' },
      }}
    >
      <Box className="m-8 overflow-auto flex items-start ml-3 flex-1 justify-between">
        <List>
          <ListItem key="Chat" className="flex-1">
            <ListItemIcon>
              <ChatBubbleOutlineIcon />
            </ListItemIcon>
            <ListItemText className="flex-1 mr-4" primary="Chat" />
          </ListItem>
        </List>
      </Box>
      <Box className="m-8 flex flex-1 items-end justify-center">
        <Box className="items-start"><Avatar className="mr-2"/></Box>
        <Typography className="flex-1 m-2">{formatName(username)}</Typography>
        <Link href="/">
            <LogoutIcon className="flex-1 m-2"/>
        </Link>
      </Box>
    </Drawer>
  );
};
