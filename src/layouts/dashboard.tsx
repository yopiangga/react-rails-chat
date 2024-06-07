import { Routes, Route } from "react-router-dom";
import { Sidenav, DashboardNavbar, Footer } from "src/widgets/layout";
import routes from "src/routes";
import { Toaster } from "react-hot-toast";
import { useContext, useEffect, useState } from "react";
import { ConnectionContext } from "src/context/ConnectionContext";
import { socket } from "src/socket";
import { MessageContext } from "src/context/MessageContext";
import { UserContext } from "src/context/UserContext";
import { ProfileContext } from "src/context/ProfileContext";
import { UserServices } from "src/services/UserServices";
import { User } from "src/types/user";
import LoadComponent from "src/widgets/load";
import { MessageServices } from "src/services/MessageServices";

export function DashboardLayout() {
  const userServices = new UserServices();
  const messageServices = new MessageServices();

  const { connected, handleConnection } = useContext(ConnectionContext);
  const { messages, addMessage, init } = useContext(MessageContext);
  const { users, initUsers } = useContext(UserContext);
  const { profile, initProfile } = useContext(ProfileContext);

  const [isLoading, setIsLoading] = useState(false);

  socket.onopen = () => {
    handleConnection();

    socket.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          id: Math.random().toString(36).substr(2, 9),
          channel: "MessagesChannel",
        }),
      })
    );
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type == "ping") return;
    if (data.type == "welcome") return;
    if (data.type == "confirm_subscription") return;

    const temp = data.message;
    addMessage(JSON.parse(temp.body));
  };

  useEffect(() => {
    fetchData();
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const res = await messageServices.getMessages();

    if (res.length >= 0) {
      const temp = res.map((item: any) => {
        return JSON.parse(item.body);
      });

      init(temp);
    }
  }

  const fetchData = async () => {
    setIsLoading(true);
    const response = await userServices.getUsers();
    const userWithImages = response.map((user: User) => ({
      ...user,
      avatar: `https://picsum.photos/50?random=${user.id}`,
    }));
    initUsers(userWithImages);
    initProfile(
      userWithImages[Math.floor(Math.random() * userWithImages.length)]
    );

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav brandName="Prisma App" routes={routes} />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />

        {isLoading && <LoadComponent />}

        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route path={path} element={element} />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </div>
  );
}

export default DashboardLayout;
