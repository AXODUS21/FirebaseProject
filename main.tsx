import { getDocs, collection } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useEffect, useState } from 'react';
import { Post } from './post'
//getDocs can get multiple documents that u can use (is different from getDoc)
export interface Post {
  id: string;
  userID: string;
  title: string;
  username: string;
  description: string;
}

function Main() {
  const postsRef = collection(db, "posts");
  const [postList, setPostList] = useState<Post[] | null>(null)

  const getPost = async () => {
    //Represents the Data from the database
    const data = await getDocs(postsRef);
    setPostList(data.docs.map((doc) =>({...doc.data(), id: doc.id})) as Post[] );
  }

  useEffect(() => {
    getPost();
  }, [])
  return (
    <div>{postList?.map((post) => <Post post={post}/> )}</div>
  )
}

export default Main