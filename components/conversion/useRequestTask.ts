"use client";

import { useEffect, useRef } from "react";
import { RequestTask } from "@/lib/requestTask";

export default function useRequestTask() {
  const task = useRef<RequestTask>();
  if (!task.current) task.current = new RequestTask();
  const current = task.current;
  useEffect(() => () => current.cancel(), [current]);
  return current;
}
