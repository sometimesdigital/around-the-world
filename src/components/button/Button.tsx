import { HTMLAttributes } from "react";

export const Button = ({ children, ...props }: HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className="button" type="button" {...props}>
      {children}
    </button>
  );
};
