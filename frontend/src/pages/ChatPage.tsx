import { useEffect, useState } from "react";
import { useParams } from "react-router"
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import ChatLoader from "../components/ChatLoader";

import{Channel,
  ChannelHeader,
  Chat,
  MessageList,
  Thread,
  Window} from "stream-chat-react"
import { StreamChat, type Channel as StreamChannel } from "stream-chat";
import toast from "react-hot-toast";

const STREAM_API_KEY=import.meta.env.VITE_STREAM_API_KEY;


const ChatPage = () => {

  const {friendId:targetUserID}=useParams();

 const [chatClient, setChatClient] = useState<StreamChat | null>(null);
 const [channel, setChannel] = useState<StreamChannel | null>(null);
 const[loading,setLoading]=useState(true);

 const {authUser}=useAuthUser();

  const {data:tokenData}=useQuery({
    queryKey:["streamToken"],
    queryFn:getStreamToken,
    enabled:!!authUser   //This is only run when authUser is available
  })

  useEffect(()=>{
    const initChat=async () => {
      if(!tokenData?.token|| !authUser) return;

      try {
        console.log("Initiliazing Stream Chat client....");

        const client=StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser({
          id:authUser._id,
          name:authUser.fullname,
          image:authUser.profileurl
        },tokenData.token)

        const channelId=[authUser._id,targetUserID].sort().join("-");

        const currChanel=client.channel("messaging",channelId,{
          members:[authUser._id,targetUserID],
        })

        await currChanel.watch();

        setChatClient(client);
        setChannel(currChanel);
        
      } catch (error) {
        console.log("error in initializing chat :",error);
        toast.error("Could not connect to chat. Please Try againn")
        
      }finally{
        setLoading(false);
      }
    }
    initChat()
  },[])
  if(loading||!channel||!chatClient) return <ChatLoader/>
  return (
    <div>

    </div>
  )
}

export default ChatPage