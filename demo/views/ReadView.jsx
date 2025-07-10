import React from "react";
import libs from "demo/libs";

const {
  LongText,
} = libs;

const ReadView = () => {
  return (
    <div>
      <LongText value={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} separator=", " maxLength={2} />
      <LongText value={1} />
      <LongText value="我是中国人，我爱中国!" maxLength={2} />
      <LongText
        value={[
          { id: 1, username: "admin", nickname: "管理员" },
          { id: 2, username: "skyler", nickname: "Skyler" },
          { id: 3, username: "user3", nickname: "用户3" },
          { id: 4, username: "user4", nickname: "用户4" },
          // { id: 5, username: "user5", nickname: "用户5" },
        ]}
        labelTemplate="{nickname}({username})"
        maxLength={3}
      />
      <LongText value={{ id: 1, username: "admin", nickname: "管理员" }} labelTemplate="{nickname}({username})" />
    </div>
  );
};

export default ReadView;
