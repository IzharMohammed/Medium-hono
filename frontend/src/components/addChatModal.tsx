// // import { Dialog, Switch, Transition } from "@headlessui/react";
// import {
//   UserGroupIcon,
//   XCircleIcon,
//   XMarkIcon,
// } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";
import { createGroupChat, createUserChat, getAvailableUsers } from "../api";
import { classNames, requestHandler } from "../utils";
import { ChatListItemInterface } from "../interface/chat";
import { UserInterface } from "../interface/user";
// import Select from "./select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion"
import { UserIcon as UserGroup, X, XCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const AddChatModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: (chat: ChatListItemInterface) => void;
}> = ({ open, onClose, onSuccess }) => {
  // State to store the list of users, initialized as an empty array
  const [users, setUsers] = useState<UserInterface[]>([]);
  // State to store the name of a group, initialized as an empty string
  const [groupName, setGroupName] = useState("");
  // State to determine if the chat is a group chat, initialized as false
  const [isGroupChat, setIsGroupChat] = useState(false);
  // State to store the list of participants in a group chat, initialized as an empty array
  const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
  // State to store the ID of a selected user, initialized as null
  const [selectedUserId, setSelectedUserId] = useState<null | string>(null);
  // State to determine if a chat is currently being created, initialized as false
  const [creatingChat, setCreatingChat] = useState(false);

  // Function to fetch users
  const getUsers = async () => {
    // Handle the request to get available users
    requestHandler(
      // Callback to fetch available users
      async () => await getAvailableUsers(),
      null, // No loading setter callback provided
      // Success callback
      (res) => {
        const { data } = res; // Extract data from response
        setUsers(data || []); // Set users data or an empty array if data is absent
      },
      alert // Use the alert as the error handler
    );
  };

  // Function to create a new chat with a user
  const createNewChat = async () => {
    // If no user is selected, show an alert
    if (!selectedUserId) return alert("Please select a user");

    // Handle the request to create a chat
    await requestHandler(
      // Callback to create a user chat
      async () => await createUserChat(selectedUserId),
      setCreatingChat, // Callback to handle loading state
      // Success callback
      (res) => {
        const { data } = res; // Extract data from response
        // If chat already exists with the selected user
        if (res.statusCode === 200) {
          alert("Chat with selected user already exists");
          return;
        }
        onSuccess(data); // Execute the onSuccess function with received data
        handleClose(); // Close the modal or popup
      },
      alert // Use the alert as the error handler
    );
  };

  // Function to create a new group chat
  const createNewGroupChat = async () => {
    // Check if a group name is provided
    if (!groupName) return alert("Group name is required");
    // Ensure there are at least 2 group participants
    if (!groupParticipants.length || groupParticipants.length < 2)
      return alert("There must be at least 2 group participants");

    // Handle the request to create a group chat
    await requestHandler(
      // Callback to create a group chat with name and participants
      async () =>
        await createGroupChat({
          name: groupName,
          participants: groupParticipants,
        }),
      setCreatingChat, // Callback to handle loading state
      // Success callback
      (res) => {
        const { data } = res; // Extract data from response
        onSuccess(data); // Execute the onSuccess function with received data
        handleClose(); // Close the modal or popup
      },
      alert // Use the alert as the error handler
    );
  };

  // Function to reset local state values and close the modal/dialog
  const handleClose = () => {
    // Clear the list of users
    setUsers([]);
    // Reset the selected user ID
    setSelectedUserId("");
    // Clear the group name
    setGroupName("");
    // Clear the group participants list
    setGroupParticipants([]);
    // Set the chat type to not be a group chat
    setIsGroupChat(false);
    // Execute the onClose callback/function
    onClose();
  };

  // useEffect hook to perform side effects based on changes in the component lifecycle or state/props
  useEffect(() => {
    // Check if the modal/dialog is not open
    if (!open) return;
    // Fetch users if the modal/dialog is open
    getUsers();
    // The effect depends on the 'open' value. Whenever 'open' changes, the effect will re-run.
  }, [open]);

  // return (
  //   <Transition.Root show={open} as={Fragment}>
  //     <Dialog as="div" className="relative z-10" onClose={handleClose}>
  //       <Transition.Child
  //         as={Fragment}
  //         enter="ease-out duration-300"
  //         enterFrom="opacity-0"
  //         enterTo="opacity-100"
  //         leave="ease-in duration-200"
  //         leaveFrom="opacity-100"
  //         leaveTo="opacity-0"
  //       >
  //         <div className="fixed inset-0 bg-black/50 bg-opacity-75 transition-opacity" />
  //       </Transition.Child>

  //       <div className="fixed inset-0 z-10 overflow-y-visible">
  //         <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
  //           <Transition.Child
  //             as={Fragment}
  //             enter="ease-out duration-300"
  //             enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  //             enterTo="opacity-100 translate-y-0 sm:scale-100"
  //             leave="ease-in duration-200"
  //             leaveFrom="opacity-100 translate-y-0 sm:scale-100"
  //             leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  //           >
  //             <Dialog.Panel
  //               className="relative transform overflow-x-hidden rounded-lg bg-dark px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6"
  //               style={{
  //                 overflow: "inherit",
  //               }}
  //             >
  //               <div>
  //                 <div className="flex justify-between items-center">
  //                   <Dialog.Title
  //                     as="h3"
  //                     className="text-lg font-semibold leading-6 text-white"
  //                   >
  //                     Create chat
  //                   </Dialog.Title>
  //                   <button
  //                     type="button"
  //                     className="rounded-md bg-transparent text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2"
  //                     onClick={() => handleClose()}
  //                   >
  //                     <span className="sr-only">Close</span>
  //                     <XMarkIcon className="h-6 w-6" aria-hidden="true" />
  //                   </button>
  //                 </div>
  //               </div>
  //               <div>
  //                 <Switch.Group as="div" className="flex items-center my-5">
  //                   <Switch
  //                     checked={isGroupChat}
  //                     onChange={setIsGroupChat}
  //                     className={classNames(
  //                       isGroupChat ? "bg-secondary" : "bg-zinc-200",
  //                       "relative outline outline-[1px] outline-white inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-0"
  //                     )}
  //                   >
  //                     <span
  //                       aria-hidden="true"
  //                       className={classNames(
  //                         isGroupChat
  //                           ? "translate-x-5 bg-success"
  //                           : "translate-x-0 bg-white",
  //                         "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
  //                       )}
  //                     />
  //                   </Switch>
  //                   <Switch.Label as="span" className="ml-3 text-sm">
  //                     <span
  //                       className={classNames(
  //                         "font-medium text-white",
  //                         isGroupChat ? "" : "opacity-40"
  //                       )}
  //                     >
  //                       Is it a group chat?
  //                     </span>{" "}
  //                   </Switch.Label>
  //                 </Switch.Group>
  //                 {isGroupChat ? (
  //                   <div className="my-5">
  //                     <Input
  //                       placeholder={"Enter a group name..."}
  //                       value={groupName}
  //                       onChange={(e) => {
  //                         setGroupName(e.target.value);
  //                       }}
  //                     />
  //                   </div>
  //                 ) : null}
  //                 <div className="my-5">
  //                   <Select
  //                     placeholder={
  //                       isGroupChat
  //                         ? "Select group participants..."
  //                         : "Select a user to chat..."
  //                     }
  //                     value={isGroupChat ? "" : selectedUserId || ""}
  //                     options={users.map((user) => {
  //                       return {
  //                         label: user.username,
  //                         value: user.id,
  //                       };
  //                     })}
  //                     onChange={({ value }) => {
  //                       if (isGroupChat && !groupParticipants.includes(value)) {
  //                         // if user is creating a group chat track the participants in an array
  //                         setGroupParticipants([...groupParticipants, value]);
  //                       } else {
  //                         setSelectedUserId(value);
  //                         // if user is creating normal chat just get a single user
  //                       }
  //                     }}
  //                   />
  //                 </div>
  //                 {isGroupChat ? (
  //                   <div className="my-5">
  //                     <span
  //                       className={classNames(
  //                         "font-medium inline-flex items-center"
  //                       )}
  //                     >
  //                       <UserGroupIcon className="h-5 w-5 mr-2" /> Selected
  //                       participants
  //                     </span>{" "}
  //                     <div className="flex justify-start items-center flex-wrap gap-2 mt-3">
  //                       {users
  //                         .filter((user) =>
  //                           groupParticipants.includes(user.id)
  //                         )
  //                         ?.map((participant): any => {
  //                           return (
  //                             <div
  //                               className="inline-flex bg-secondary rounded-full p-2 border-[1px] border-zinc-400 items-center gap-2"
  //                               key={participant.id}
  //                             >
  //                               <img
  //                                 className="h-6 w-6 rounded-full object-cover"
  //                                 src={participant?.avatar?.url}
  //                               />
  //                               <p className="">
  //                                 {participant.username}
  //                               </p>
  //                               <XCircleIcon
  //                                 role="button"
  //                                 className="w-6 h-6 hover:text-primary cursor-pointer"
  //                                 onClick={() => {
  //                                   setGroupParticipants(
  //                                     groupParticipants.filter(
  //                                       (p) => p !== participant.id
  //                                     )
  //                                   );
  //                                 }}
  //                               />
  //                             </div>
  //                           );
  //                         })}
  //                     </div>
  //                   </div>
  //                 ) : null}
  //               </div>
  //               <div className="mt-5 flex justify-between items-center gap-4">
  //                 <Button
  //                   disabled={creatingChat}
  //                   // severity={"secondary"}
  //                   onClick={handleClose}
  //                   className="w-1/2"
  //                 >
  //                   Close
  //                 </Button>
  //                 <Button
  //                   disabled={creatingChat}
  //                   onClick={isGroupChat ? createNewGroupChat : createNewChat}
  //                   className="w-1/2"
  //                 >
  //                   Create
  //                 </Button>
  //               </div>
  //             </Dialog.Panel>
  //           </Transition.Child>
  //         </div>
  //       </div>
  //     </Dialog>
  //   </Transition.Root>
  // );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-3xl overflow-visible bg-background">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">Create chat</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6 rounded-full">
              {/* <X className="h-4 w-4" /> */}
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <Switch checked={isGroupChat} onCheckedChange={setIsGroupChat} id="group-chat-toggle" />
            <Label htmlFor="group-chat-toggle" className={`font-medium ${isGroupChat ? "" : "opacity-40"}`}>
              Is it a group chat?
            </Label>
          </div>

          <AnimatePresence>
            {isGroupChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Input
                  placeholder="Enter a group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <Select
              value={isGroupChat ? undefined : selectedUserId || undefined}
              onValueChange={(value) => {
                if (isGroupChat && !groupParticipants.includes(value)) {
                  // if user is creating a group chat track the participants in an array
                  setGroupParticipants([...groupParticipants, value])
                } else {
                  // if user is creating normal chat just get a single user
                  setSelectedUserId(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={isGroupChat ? "Select group participants..." : "Select a user to chat..."} />
              </SelectTrigger>
              <SelectContent
                side="bottom" // Forces dropdown to appear below
                position="popper" // Ensures proper positioning
                align="start" // Aligns dropdown with the trigger
                className="mt-1" // Adds a small gap
              >
                <SelectGroup>
                  <SelectLabel>Users</SelectLabel>
                  {
                    users.map((user) => (
                      <SelectItem value={user.id}>{user.name}</SelectItem>

                    ))
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* <div>
            <label htmlFor="user-select" className="block text-sm font-medium mb-1">
              {isGroupChat ? "Select group participants..." : "Select a user to chat..."}
            </label>
            <select
              id="user-select"
              value={isGroupChat ? "" : selectedUserId || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (isGroupChat && !groupParticipants.includes(value)) {
                  setGroupParticipants([...groupParticipants, value]);
                } else {
                  setSelectedUserId(value);
                }
              }}
              className="w-full p-2 border rounded-md bg-background text-foreground"
            >
              <option value="" disabled>
                {isGroupChat ? "Select participants..." : "Select a user..."}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div> */}
          <AnimatePresence>
            {isGroupChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div>
                  <div className="flex items-center font-medium">
                    <UserGroup className="h-5 w-5 mr-2" />
                    Selected participants
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <AnimatePresence>
                      {users
                        .filter((user) => groupParticipants.includes(user.id))
                        .map((participant) => (
                          <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Badge variant="secondary" className="pl-1 flex items-center gap-2 border border-border">
                              {participant.avatar?.url && (
                                <img
                                  className="h-6 w-6 rounded-full object-cover"
                                  src={participant.avatar.url || "/placeholder.svg"}
                                  alt={participant.name}
                                />
                              )}
                              <span>{participant.name}</span>
                              <XCircle
                                className="h-5 w-5 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  setGroupParticipants(groupParticipants.filter((p) => p !== participant.id))
                                }}
                              />
                            </Badge>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between items-center gap-4 sm:justify-between">
          <Button variant="outline" disabled={creatingChat} onClick={handleClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button
            disabled={creatingChat}
            onClick={isGroupChat ? createNewGroupChat : createNewChat}
            className="w-full sm:w-auto"
          >
            {creatingChat ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default AddChatModal;
