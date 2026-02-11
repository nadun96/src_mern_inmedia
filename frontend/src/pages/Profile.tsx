import React from "react";
import "./Profile.css";

type Props = {};

const Profile = (props: Props) => {
  const state = JSON.parse(localStorage.getItem("user") || "{}");
  const [myposts, setMyposts] = React.useState([]);
  React.useEffect(() => {
    fetch("/myposts", {
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setMyposts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="main-container">
      <div className="profile-container">
        <div>
          <img
            style={{ width: "166px", height: "166px", borderRadius: "83px" }}
            src={state ? state.profilePicUrl : "Loading..."}
          />
        </div>
        <div className="details-section">
          <h4>{state ? state.fullName : "Loading..."}</h4>
          <h5>{state ? state.email : "Loading..."}</h5>
          <div className="followings">
            <h6>{myposts.length} posts</h6>
            <h6>
              {state && state.hasOwnProperty("followers")
                ? state.followers.length
                : 0}{" "}
              followers
            </h6>
            <h6>
              {state && state.hasOwnProperty("following")
                ? state.following.length
                : 0}{" "}
              following
            </h6>
          </div>
        </div>
      </div>
      <div className="posts">
        {myposts.map((post) => {
          return (
            <img
              src={post.image}
              className="post"
              alt={post.title}
              key={post._id}
            />
          );
        })}
      </div>
    </div>
  );
};
export default Profile;
