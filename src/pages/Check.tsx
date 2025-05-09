import React from 'react';

interface OrderItem {
  name: string;
  quantity: string;
  unit: string;
  price: number;
}

function Check() {
  const orderItems: OrderItem[] = [
    {
      name: 'Сушеное мясодома шнего Сушеноемя..',
      quantity: '10',
      unit: 'кг',
      price: 130,
    },
    {
      name: 'Сушеная рыба',
      quantity: '8',
      unit: 'шт',
      price: 50,
    },
    {
      name: 'Помидоры',
      quantity: '4',
      unit: 'кг',
      price: 48,
    },
  ];

  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* En-tête violet */}
      <div className="h-20 bg-[#4F46E5]"></div>

      {/* Contenu principal */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Section Commande */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Ваш заказ</h1>

          {/* Liste des articles */}
          <div className="space-y-4 mb-6">
            <div className="border-t border-b border-dashed border-gray-300 py-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <p className="text-gray-800">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      x {item.quantity} {item.unit}
                    </span>
                    <span className="text-gray-800 font-medium w-20 text-right">
                      {item.price} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Итого</span>
            <span className="text-xl font-bold">{total} €</span>
          </div>
        </div>

        {/* Section Informations de livraison */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Информация для отправки</h2>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-[#4F46E5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Имя"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Фамилия"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-gray-50"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <input
                type="tel"
                placeholder="Номер телефона"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-gray-50"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 top-3 flex items-start pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <textarea
                placeholder="Напишите полный и правильный адрес для быстрой доставки."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-gray-50 min-h-[100px]"
              />
            </div>
          </div>

          <button className="w-full bg-[#4F46E5] text-white py-4 rounded-full text-lg font-medium hover:bg-[#4338CA] transition-colors mt-8">
            Заказать
          </button>
        </div>
      </div>
    </div>
  );
}

export default Check;
