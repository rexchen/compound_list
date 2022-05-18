import React, { useState, useEffect } from 'react';
import _ from 'lodash';

function App() {
  const [data, setData] = useState({ accounts: [] });
  useEffect(() => {
    let index = 0;
    let allData = [];
    const fetchData = async (pager) => {
      const query = `
      {
        accounts(first: 1000, where: {hasBorrowed: true, id_gt: "${pager}"}) {
          id
          health
          totalBorrowValueInEth
          totalCollateralValueInEth
        }
      }
      `;
      const data = await fetch('https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2', {
        body: JSON.stringify({
          query,
        }),
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });
      let result = await data.json();
      let accounts = result.data.accounts;
      allData = allData.concat(accounts);

      console.log(accounts.length);
      if (accounts.length < 1000) {
        allData = _.filter(allData, function (o) {
          return o.totalBorrowValueInEth != '0' && parseFloat(o.health) < 0.5;
        });
        allData = _.sortBy(allData, function (o) {
          return o.health;
        });
        setData({ accounts: allData });
      } else {
        index = accounts[999].id;
        fetchData(index);
      }
    };

    fetchData(index);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">用戶列表</h1>
          <p className="mt-2 text-sm text-gray-700">需要被清算的用戶</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Address
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Health
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      totalBorrowValueInEth
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      totalCollateralValueInEth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.accounts.map((o) => (
                    <tr key={o.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <a href={'https://etherscan.io/address/' + o.id} target="_blank">
                          {o.id}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {Math.floor(o.health * 100)}%
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{o.totalBorrowValueInEth}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {o.totalCollateralValueInEth}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
