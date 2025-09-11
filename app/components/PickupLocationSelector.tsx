import * as React from 'react';
import {CartForm} from '@shopify/hydrogen';

type PickupLocation = {
  id: string;
  label: string;
};

/**
 * Renders a simple list of pickup locations and updates the cart buyer identity
 * preferences when submitted.
 *
 * Notes:
 * - preferences.delivery.pickupHandle accepts Shopify Location IDs (for local pickup)
 *   or external IDs from pickup point providers.
 */
export function PickupLocationSelector({
  locations,
  title = 'Pickup location',
}: {
  locations: PickupLocation[];
  title?: string;
}) {
  const [selectedId, setSelectedId] = React.useState<string>('');

  const disabled = locations.length === 0;

  return (
    <div className="pickup-location-selector">
      <h5>{title}</h5>
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.BuyerIdentityUpdate}
        inputs={{
          buyerIdentity: selectedId
            ? {
                preferences: {
                  delivery: {
                    pickupHandle: [selectedId],
                    deliveryMethod: ['PICK_UP'],
                  },
                },
              }
            : {
                // Clear pickup preference by sending an empty array when no selection
                preferences: {
                  delivery: {
                    pickupHandle: [],
                    deliveryMethod: ['SHIPPING'],
                  },
                },
              },
          // Update a cart attribute to mirror the checkout preference
          attributes: selectedId
            ? [{key: 'deliveryMethod', value: 'PICK_UP'}]
            : [{key: 'deliveryMethod', value: ''}],
        }}
      >
        {(fetcher) => (
          <div className="pickup-location-selector-form">
            <label htmlFor="pickup-location-select" className="sr-only">
              {title}
            </label>
            <select
              id="pickup-location-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={disabled || fetcher.state !== 'idle'}
            >
              <option value="">No preference</option>
              {locations.map((location) => (
                <option value={location.id} key={location.id}>
                  {location.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={disabled || fetcher.state !== 'idle'}
              style={{marginLeft: 8}}
            >
              Save
            </button>
          </div>
        )}
      </CartForm>
      <p style={{marginTop: 8, fontSize: 12, opacity: 0.8}}>
        Your selection is saved to cart preferences for checkout.
      </p>
    </div>
  );
}
