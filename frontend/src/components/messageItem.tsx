"use client"

import type React from "react"
import {
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassPlusIcon,
  PaperClipIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid"
import moment from "moment"
import { useState } from "react"
import { classNames } from "../utils"
import type { ChatMessageInterface } from "../interface/chat"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Button } from "./ui/button"

const MessageItem: React.FC<{
  isOwnMessage?: boolean
  isGroupChatMessage?: boolean
  message: ChatMessageInterface
  deleteChatMessage: (message: ChatMessageInterface) => void
}> = ({ message, isOwnMessage, isGroupChatMessage, deleteChatMessage }) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null)
  const [openOptions, setOpenOptions] = useState<boolean>(false)
  const [hoveringMessage, setHoveringMessage] = useState(false)
  const [clickedOptions, setClickedOptions] = useState(false)

  return (
    <>
      {resizedImage && (
        <div className="h-full z-40 p-8 overflow-hidden w-full absolute inset-0 bg-black/70 flex justify-center items-center">
          <XMarkIcon
            className="absolute top-5 right-5 w-9 h-9 text-white cursor-pointer"
            onClick={() => setResizedImage(null)}
          />
          <img
            className="w-full h-full object-contain"
            src={resizedImage || "/placeholder.svg"}
            alt="chat image"
          />
        </div>
      )}

      <div className={classNames(
        "flex justify-start items-end gap-3 max-w-lg min-w-",
        isOwnMessage ? "ml-auto" : ""
      )}>
        <img
          src={message.sender?.avatar?.url || "/placeholder.svg"}
          className={classNames(
            "h-7 w-7 object-cover rounded-full flex flex-shrink-0",
            isOwnMessage ? "order-2" : "order-1",
          )}
        />

        <div
          onMouseEnter={() => setHoveringMessage(true)}
          onMouseLeave={() => {
            setHoveringMessage(false)
            if (!clickedOptions) setOpenOptions(false)
          }}
          className={classNames(
            "p-4 rounded-3xl flex flex-col relative",
            isOwnMessage
              ? "order-1 rounded-br-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white dark:from-emerald-600 dark:to-teal-700 dark:text-white shadow-md"
              : "order-2 rounded-bl-none bg-secondary dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700",
          )}
        >
          {isGroupChatMessage && !isOwnMessage && (
            <p className={classNames(
              "text-xs font-semibold mb-2",
              // ["text-success", "text-danger"][message.sender.name.length % 2],
            )}>
              {/* {message.sender?.name} */}
            </p>
          )}

          {message?.attachments?.length > 0 ? (
            <div>
              {isOwnMessage && (
                <button
                  className="self-center p-1 relative options-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenOptions(!openOptions)
                    setClickedOptions(!openOptions)
                  }}
                >
                  <EllipsisVerticalIcon
                    className={`${(hoveringMessage || openOptions)
                      ? 'w-4 opacity-100'
                      : 'w-0 opacity-0'
                      } transition-all ease-in-out duration-100 text-white/80`}
                  />
                </button>
              )}

              <div className={classNames(
                "grid max-w-7xl gap-2",
                message.attachments?.length === 1 ? "grid-cols-1" : "",
                message.attachments?.length === 2 ? "grid-cols-2" : "",
                message.attachments?.length >= 3 ? "grid-cols-3" : "",
                message.content ? "mb-6" : "",
              )}>
                {message.attachments?.map((file) => (
                  <div
                    key={file._id}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                  >
                    <button
                      onClick={() => setResizedImage(file.url)}
                      className="absolute inset-0 z-20 flex justify-center items-center w-full gap-2 h-full bg-black/60 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150"
                    >
                      <MagnifyingGlassPlusIcon className="h-6 w-6 text-white" />
                      <a href={file.url} download onClick={(e) => e.stopPropagation()}>
                        <ArrowDownTrayIcon
                          title="download"
                          className="hover:text-zinc-400 h-6 w-6 text-white cursor-pointer"
                        />
                      </a>
                    </button>
                    <img
                      className="h-full w-full object-cover"
                      src={file.url || "/placeholder.svg"}
                      alt="msg_img"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {message.content && (
            <div className="relative flex justify-between">
              {isOwnMessage && (
                <button
                  className="self-center relative options-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenOptions(!openOptions)
                    setClickedOptions(!openOptions)
                  }}
                >
                  <EllipsisVerticalIcon
                    className={`${(hoveringMessage || openOptions)
                      ? 'w-4 opacity-100'
                      : 'w-0 opacity-0'
                      } transition-all ease-in-out duration-100 text-white/80`}
                  />
                </button>
              )}

              <p className="text-sm">{message.content}</p>
            </div>
          )}

          {isOwnMessage && openOptions && (
            <div
              className="delete-menu z-20 text-left -translate-x-24 -translate-y-4 w-[2rem] h-[1rem] absolute bottom-0 text-[10px]  bg-white dark:bg-zinc-900 rounded-2xl shadow-md border-[1px] border-zinc-200 dark:border-zinc-700"
              onMouseLeave={() => {
                setOpenOptions(false)
                setClickedOptions(false)
              }}
            >
              {/* <p
                onClick={(e) => {
                  e.stopPropagation()
                  const ok = confirm("Are you sure you want to delete this message")
                  if (ok) {
                    deleteChatMessage(message)
                  }
                  setOpenOptions(false)
                  setClickedOptions(false)
                }}
                role="button"
                className="p-2 text-red-500 rounded-lg w-auto inline-flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <TrashIcon className="h-4 w-auto mr-1" />
                Delete Message
              </p> */}
              <Dialog>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <div className="flex gap-4">
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          console.log("message",message);
                          deleteChatMessage(message)
                          setOpenOptions(false);
                          setClickedOptions(false);
                        }}
                      > yes</Button>
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenOptions(false);
                          setClickedOptions(false);
                        }}
                      >No</Button>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

            </div>
          )}

          <p
            className={classNames(
              "mt-1.5 self-end text-[10px] inline-flex items-center",
              isOwnMessage ? "text-white/90" : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {message.attachments?.length > 0 && <PaperClipIcon className="h-4 w-4 mr-2" />}
            {moment(message.updatedAt).add("TIME_ZONE", "hours").fromNow(true)} ago
          </p>
        </div>
      </div>
    </>
  )
}

export default MessageItem