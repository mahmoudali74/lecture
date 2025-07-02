import React from "react";
import Image from "next/image";

function NoItem(props) {
  return (
    <div className="flex items-center justify-center flex-col">
      <div>
        <Image
          src={"/logo.jpg"}
          width={330}
          height={200}
          alt="logo"
          className="object-fill"
        />
      </div>
      <div>
        <p className="text-xl -mt-10 mb-40">{props.text}</p>
      </div>
    </div>
  );
}

export default NoItem;
