import React from 'react';

interface OrderCardProps {
  firstName: string;
  lastName: string;
  address: string;
  tagNames: string[];
  products: any;
  isSelectionMode?: boolean;
  isSelected?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  firstName,
  lastName,
  address,
  tagNames,
  products,
  isSelectionMode = false,
  isSelected = false,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md cursor-pointer relative hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500">
      {/* Checkbox en mode sélection */}
      {isSelectionMode && (
        <div className="absolute top-4 right-4">
          <div
            className="w-5 h-5 rounded border-2 flex items-center justify-center border-green-500"
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={isSelectionMode ? 0 : -1}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium m-0">
          {firstName} {lastName}
        </h2>
      </div>

      <div className="flex items-center gap-2 text-gray-600">
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
        >
          <path
            d="M12.18 4.3115C12.8533 5.75817 12.7 7.46484 11.96 8.8515C11.3333 9.97817 10.4333 10.9315 9.66668 11.9782C9.33335 12.4448 9.00001 12.9448 8.75335 13.4848C8.66668 13.6648 8.60668 13.8515 8.54001 14.0382C8.47335 14.2248 8.41334 14.4115 8.35334 14.5982C8.29334 14.7715 8.22001 14.9782 8.00001 14.9782C7.74001 14.9782 7.66668 14.6848 7.61335 14.4848C7.45335 13.9982 7.29334 13.5315 7.04668 13.0848C6.76668 12.5582 6.41335 12.0715 6.05335 11.5982L12.18 4.3115ZM6.08001 5.92484L3.88001 8.53817C4.28668 9.39817 4.89335 10.1315 5.47335 10.8648C5.61335 11.0315 5.75335 11.2048 5.88668 11.3848L8.66668 8.0915L8.64001 8.09817C7.66668 8.4315 6.58668 7.93817 6.20001 6.97817C6.14668 6.86484 6.10668 6.7315 6.08001 6.59817C6.04271 6.37751 6.04271 6.15216 6.08001 5.9315V5.92484ZM4.38668 3.3915L4.38001 3.39817C3.30001 4.76484 3.11334 6.66484 3.76001 8.2715L6.42001 5.1115L6.38668 5.07817L4.38668 3.3915ZM9.48001 1.88484L7.33335 4.42484L7.36001 4.41817C8.25335 4.1115 9.25335 4.49817 9.70668 5.3115C9.80668 5.49817 9.88668 5.69817 9.91335 5.89817C9.95335 6.1515 9.96668 6.3315 9.92001 6.57817V6.58484L12.0533 4.0515C11.4951 3.03826 10.5804 2.26848 9.48668 1.8915L9.48001 1.88484ZM6.59335 4.90484L9.20001 1.80484L9.17335 1.79817C8.78668 1.69817 8.39335 1.64484 8.00001 1.64484C6.68668 1.64484 5.44668 2.2115 4.56668 3.18484L4.55335 3.1915L6.59335 4.90484Z"
            fill="#22C55D"
          />
        </svg>{' '}
        <span className="text-sm">{address}</span>
      </div>
      <hr className="w-full my-3" />

      <div className="flex flex-wrap gap-2">
        {tagNames.map(tag => (
          <span key={tag} className="font-light bg-gray-100 rounded-lg px-2 py-1 text-sm">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;
