import { Link } from "react-router-dom";

import type { ReceivedPlaylist } from "@lib/shared_types";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";

import "./SongListCard.css";

type SongListCardProps = {
  list: ReceivedPlaylist; // Assuming ListType is a type you've defined elsewhere or you can replace it with the appropriate type
  isDeleteMode: boolean;
  handleDelete: (id: string) => Promise<void>; // Assuming handleDelete takes a listId as a string. Adjust if different.
};

const SongListCard = ({
  list,
  isDeleteMode,
  handleDelete,
}: SongListCardProps) => {
  return (
    <Card
      style={{ position: "relative" }}
      className={isDeleteMode ? "shake-animation" : ""}
    >
      {isDeleteMode && (
        <IconButton
          style={{ position: "absolute", top: 0, right: 0, color: "red" }}
          onClick={() => handleDelete(list._id)}
        >
          <DeleteIcon />
        </IconButton>
      )}
      <Link to={`/playlist/${list._id}`} style={{ textDecoration: "none" }}>
        <Box
          style={{
            height: "150px",
            backgroundImage: `url("https://farm3.staticflickr.com/2439/12985065254_3e31ec34c6.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></Box>
        <CardContent>
          <Typography variant="h5" component="div">
            {list.name}
          </Typography>
          <Typography
            variant="body1"
            component="div"
            style={{ color: "#008000" }}
          >
            {list.songs.length} songs
          </Typography>
        </CardContent>
      </Link>
    </Card>
  );
};

export default SongListCard;
