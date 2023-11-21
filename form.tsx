import { useForm } from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {addDoc, collection} from 'firebase/firestore' // addDoc is used when you want to add an Item to your database
// collection is a function that specify which collections you want your document to go
import { auth, db } from '../../config/firebase'
import { useAuthState } from "react-firebase-hooks/auth";
import {useNavigate} from 'react-router-dom'

interface CreateFormData {
  title: string;
  description: string;
}

function CreateForm() {
    const [user] = useAuthState(auth)
    const navigate = useNavigate();

    const schema = yup.object().shape({
        title: yup.string().required("You must add a title").max(50, "Maximum 30 Characters"),
        description: yup.string().required().max(200,"maximum 200 characters")
    })

    const { register, handleSubmit, formState: {errors} } = useForm<CreateFormData>({
        resolver: yupResolver(schema)
    })

    const postsRef = collection(db, "posts")

    const onCreatePost = async (data: CreateFormData) => {
      //addDoc takes 2 arguments (reference to the collection you want to add something to, the data you want to add)
      await addDoc(postsRef, {
        // title: data.title,
        // description: data.description,
        ...data, //THIS REPRESENTS ALL THE VALUES IN THE DATA VARIABLE
        username: user?.displayName,
        userId: user?.uid,
      });

      navigate("/");
    }

  return (
    <div className="main">
      <div className="create-post-container">
        <form onSubmit={handleSubmit(onCreatePost)}>
          <input className="title-input" placeholder="Title..." {...register("title")} />
          <p style={{ color: "red" }}> {errors.title?.message}</p>
          <textarea className="description-input" placeholder="Description..." {...register("description")} />
          <p style={{ color: "red" }}>{errors.description?.message}</p>
          <input className="create-post-button" type="submit" value="Create A Post"  />
        </form>
      </div>
    </div>
  );
}

export default CreateForm;
