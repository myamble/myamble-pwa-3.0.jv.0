import * as React from "react";
import {
  useForm,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  UseFormProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const Form = <TFormValues extends FieldValues>({
  children,
  onSubmit,
  ...props
}: {
  children: (form: UseFormReturn<TFormValues>) => React.ReactNode;
  onSubmit: SubmitHandler<TFormValues>;
} & UseFormProps<TFormValues>) => {
  const form = useForm<TFormValues>({ ...props });
  return <form onSubmit={form.handleSubmit(onSubmit)}>{children(form)}</form>;
};

const FormField = <TFormValues extends FieldValues>({
  children,
  ...props
}: {
  children: (
    field: ReturnType<UseFormReturn<TFormValues>["register"]>,
  ) => React.ReactNode;
} & any) => {
  const { register } = useForm<TFormValues>();
  return children(register(props));
};

const FormItem = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-2">{children}</div>;
};

const FormLabel = ({ children }: { children: React.ReactNode }) => {
  return <label className="text-sm font-medium">{children}</label>;
};

const FormControl = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-1">{children}</div>;
};

const FormMessage = ({ children }: { children: React.ReactNode }) => {
  return <p className="mt-1 text-sm text-red-500">{children}</p>;
};

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage };
