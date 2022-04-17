//libraries
import Head from "next/head";
import type { NextPage } from "next";
import React, { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { ScaleLoader } from "react-spinners";

const IndexPage: NextPage = () => {
  const [socketUrl, setSocketUrl] = useState(
    "wss://ws.bitmex.com/realtime?subscribe=orderBookL2_25"
  );
  const [listAsset, setListAsset] = useState([]);
  const [numCountList, setNumCountList] = useState(6);
  const [messageHistory, setMessageHistory] = useState<any>([]);
  const { lastMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null && messageHistory.length <= 2) {
      setMessageHistory([...messageHistory, lastMessage]);
    }
    if (
      lastMessage !== null &&
      messageHistory.length == 3 &&
      listAsset[1] &&
      JSON.parse(lastMessage.data).data
    ) {
      let b;
      listAsset
        .filter(
          (item) =>
            JSON.parse(lastMessage.data).data[0].price != "" &&
            JSON.parse(lastMessage.data).data[0].price != undefined &&
            JSON.parse(lastMessage.data).data[0].price != null &&
            item.symbol == JSON.parse(lastMessage.data).data[0].symbol
        )
        .map(
          (row) =>
            (b = listAsset.indexOf(row) == 0 ? null : listAsset.indexOf(row))
        );
      listAsset.splice(b, 1, JSON.parse(lastMessage.data).data[0]);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (messageHistory.length == 3) {
      let c = [{ id: 0 }];
      messageHistory
        .slice(2, 3)
        .map((message) =>
          c.push(
            ...removeSimilarData(JSON.parse(message.data).data).slice(
              0,
              numCountList
            )
          )
        );
      setListAsset(c);
    }
  }, [messageHistory, numCountList]);

  return (
    <div className=" w-screen h-screen">
      <Head>
        <title>bitmax</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full flex flex-col items-center px-[20px] py-[20px]">
        <div className="w-full h-[100px] flex justify-center gap-4">
          <button
            onClick={() =>
              numCountList <= 25 && setNumCountList(numCountList + 5)
            }
            className="border w-[150px] h-[40px] rounded-xl"
          >
            Add +5 row
          </button>{" "}
          <button
            onClick={() =>
              numCountList > 6 && setNumCountList(numCountList - 5)
            }
            className="border w-[150px] h-[40px] rounded-xl"
          >
            Add -5 row
          </button>
        </div>
        <div className="py-[20px] w-full flex justify-center">
          {`All Assets : ${numCountList - 1}`}
        </div>
        {!listAsset[1] && (
          <div className="w-full h-[250px]  flex justify-center items-center">
            <ScaleLoader color="#3997e9" height={50} width={5} />
          </div>
        )}
        {listAsset[1] && (
          <table className="">
            <thead className="rounded-t-xl">
              <tr className="border text-center rounded-t-xl">
                <th className="border-r w-[100px]">coin</th>
                <th className="border-r w-[100px]">price</th>
                <th className="border-r w-[100px]">side</th>
              </tr>
            </thead>
            <tbody>
              {listAsset.slice(1, numCountList).map((item, idx) => (
                <tr key={idx}>
                  <td className="">
                    <div className="border-l border-t border-b rounded-l-xl  h-[50px] flex items-center justify-center">
                      {item.symbol}
                    </div>
                  </td>
                  <td className="">
                    <div className=" border-t border-b h-[50px] flex items-center justify-center">
                      {item.price}
                    </div>
                  </td>
                  <td className="">
                    {" "}
                    <div className="border-r border-t border-b rounded-r-xl  h-[50px] flex items-center justify-center">
                      {item.side}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IndexPage;

function removeSimilarData(assetList) {
  const uniqueValuesSet = new Set();
  let filteredArr = assetList.filter((obj) => {
    const isPresentInSet = uniqueValuesSet.has(obj.symbol);
    uniqueValuesSet.add(obj.symbol);
    return !isPresentInSet;
  });

  return filteredArr;
}
