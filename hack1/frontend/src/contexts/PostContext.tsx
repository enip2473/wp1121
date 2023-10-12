import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Post } from '@shared/types';
import { PostService } from '@/services/postService';
import { useUser } from './UserContext';

type PostContextType = {
  getPostByIndex: (id: number) => Post.Get.Response | null;
  getPostIndicesByUserId: (userId: string) => number[];
  votePost: (
    index: number,
    userId: string,
    vote: 'upvote' | 'downvote',
  ) => void;
  createPost: (title: string, content: string) => void;
  updatePost: (index: number, title: string, content: string) => void;
  loading: boolean;
  numPosts: number;
};

const PostContext = createContext<PostContextType | null>(null);

export const PostsProvider = ({ children }: PropsWithChildren) => {
  const [posts, setPosts] = useState<Post.Get.Response[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const numPosts: number = posts === null ? 0 : posts.length;

  const { user, upvote, downvote, undoDownvote, undoUpvote } = useUser();

  useEffect(() => {
    (async () => {
      const res = await PostService.getAll();
      setPosts(res);
    })();
  }, []);

  const getPostByIndex = (index: number) => {
    if (posts === null) return null;
    return posts[index];
  };

  const getPostIndicesByUserId = (userId: string) => {
    if (posts === null) return [];
    return posts
      .map((post, index) => (post.author._id === userId ? index : -1))
      .filter((index) => index !== -1);
  };

  const createPost = async (title: string, content: string) => {
    if (user === null) return;
    const newPost = await PostService.create({
      title,
      content,
      author: user._id,
    });
    setPosts((prevPosts) =>
      prevPosts === null ? null : [...prevPosts, newPost],
    );
  };

  /* TODO 3.3: Edit User Posts With Editor (8%) */
  const updatePost = async (index: number, title: string, content: string) => {
    if (posts === null) return;
    if (user === null) return;
    const postId = posts[index]._id;
    const updatedPostData = await PostService.update(postId, { title, content, author: user._id });
    // If the service call was successful, then updatedPostData should have the updated post.
    // Now, let's update the state with the new post data.
    const updatedPosts = [...posts];
    updatedPosts[index] = updatedPostData;
    setPosts(updatedPosts);
      /* Hint 3.3.1: Use the correct API from `PostService` to update DB */
    /* Hint 3.3.2: Use React hook to update frontend */
  };
  /* END TODO 3.3 */

  const votePost = async (
    index: number,
    userId: string,
    vote: 'upvote' | 'downvote',
  ) => {
    if (posts === null || user === null) return;
  
    const currentPost = posts[index];
  
    // Check if the user has already upvoted or downvoted the post
    const hasUpvoted = currentPost.upvotes.includes(userId);
    const hasDownvoted = currentPost.downvotes.includes(userId);
  
    if (vote === 'upvote') {
      if (hasUpvoted) {
        // Undo the upvote if the user has already upvoted
        await undoUpvotePost(index, userId);
      } else {
        // If the user has downvoted before, undo the downvote first
        if (hasDownvoted) {
          await undoDownvotePost(index, userId);
        }
        // Then upvote
        await upvotePost(index, userId);
      }
    } else if (vote === 'downvote') {
      if (hasDownvoted) {
        // Undo the downvote if the user has already downvoted
        await undoDownvotePost(index, userId);
      } else {
        // If the user has upvoted before, undo the upvote first
        if (hasUpvoted) {
          await undoUpvotePost(index, userId);
        }
        // Then downvote
        await downvotePost(index, userId);
      }
    }
  };
  

  const upvotePost = async (index: number, userId: string) => {
    if (posts === null) return;
    const newPosts = [...posts];
    newPosts[index].upvotes = [...newPosts[index].upvotes, userId];
    setPosts(newPosts);
    upvote(posts[index]._id);
    await PostService.upvote(posts[index]._id, userId);
  };

  const downvotePost = async (index: number, userId: string) => {
    if (posts === null) return;
    const newPosts = [...posts];
    newPosts[index].downvotes = [...newPosts[index].downvotes, userId];
    setPosts(newPosts);
    downvote(posts[index]._id);
    await PostService.downvote(posts[index]._id, userId);
  };

  const undoUpvotePost = async (index: number, userId: string) => {
    if (posts === null) return;
    const newPosts = [...posts];
    newPosts[index].upvotes = newPosts[index].upvotes.filter(
      (id) => id !== userId,
    );
    setPosts(newPosts);
    undoUpvote(posts[index]._id);
    await PostService.undoUpvote(posts[index]._id, userId);
  };

  const undoDownvotePost = async (index: number, userId: string) => {
    if (posts === null) return;
    const newPosts = [...posts];
    newPosts[index].downvotes = newPosts[index].downvotes.filter(
      (id) => id !== userId,
    );
    setPosts(newPosts);
    undoDownvote(posts[index]._id);
    await PostService.undoDownvote(posts[index]._id, userId);
  };

  return (
    <PostContext.Provider
      value={{
        loading,
        numPosts,
        getPostByIndex,
        getPostIndicesByUserId,
        votePost,
        createPost,
        updatePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const postContext = useContext(PostContext);
  if (postContext === null)
    throw 'PostContext Should Only be Used inside PostsProvider';
  return postContext;
};
