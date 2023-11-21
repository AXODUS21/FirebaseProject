import { addDoc, getDocs, deleteDoc , collection, query, where, doc } from 'firebase/firestore';
//query helps you get what specific value you want to get in your firebase collection
import { auth, db } from '../../config/firebase';
import { Post as PostStructure } from './main'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';

interface Props {
  post: PostStructure;
}

interface Like{
  likeId: string;
  userId: string;
}

export const Post = (props : Props) => {
    const { post } = props;
    const [user] = useAuthState(auth);

    const [likes, setLikes] = useState<Like[] | null>(null);
    //db represents the database the was made in firebase
    //while the ("likes") represents the like that was in the database in firebase
    const likesRef = collection(db, "likes");

    const likesDoc = query(likesRef, where("postId", "==", post.id))
    /*
      "where" takes in 3 things:
      1. what field u want to compare
      2. an operation u want to do
      3. the data
    */
    const getLikes = async () => {
      const data = await getDocs(likesDoc)
      setLikes(data.docs.map((doc) =>({ userId: doc.data().userId, likeId: doc.id})))
    }
    const addLike = async () => {
      //addDoc takes 2 arguments (reference to the collection you want to add something to, the data you want to add)
      try {
        const newDoc = await addDoc(likesRef, {
          userId: user?.uid,
          postId: post.id,
        });
        if (user) {
          setLikes((prev) =>
            prev
              ? [...prev, { userId: user?.uid, likeId: newDoc.id }]
              : [{ userId: user?.uid, likeId: newDoc.id }]
          );
        }
      } catch (err) {
        console.log(err);
      }
    };

    const removeLike = async () => {
      //addDoc takes 2 arguments (reference to the collection you want to add something to, the data you want to add)
      try {
        const likeToDeleteQuery = query(likesRef, 
        where("postId", "==", post.id), 
        where("userId", "==", user?.uid)
        );

        //"doc" specifies a document that u want to remove from ur collection
        const likeToDeleteData = await getDocs(likeToDeleteQuery)
        const likeId = likeToDeleteData.docs[0].id;
        const likeToDelete = doc(db, "likes", likeId )
        await deleteDoc(likeToDelete);
        if (user) {
          setLikes((prev) =>
            prev && prev.filter((like) => like.likeId !== likeId)
            );
        }
      } catch (err) {
        console.log(err);
      }
    };

    
    
    //the "find" method loops through the array and looks for a certain condition
    const hasUserLiked = likes?.find((like) => like.userId === user?.uid)

    useEffect(() => {
      getLikes();
    },[likes])
  return (
    <div className="post-container">
      <div className="post">
        <div className="title">
          <h1>{post.title}</h1>
        </div>
        <div className="body">
          <p>{post.description}</p>
        </div>
        <div className="footer">
          <p className="username">@{post.username}</p>
          {likes && <p className="like-amount">Likes :{likes?.length} </p>}
          <button
            className="like-button"
            onClick={hasUserLiked ? removeLike : addLike}
          >
            {hasUserLiked ? <>&#128078;</> : <>&#128077;</>}
          </button>
        </div>
      </div>
    </div>
  );
}


