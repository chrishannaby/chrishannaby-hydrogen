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
  selectedId: controlledSelectedId,
}: {
  locations: PickupLocation[];
  title?: string;
  selectedId?: string;
}) {
  const initialSelectedId = React.useMemo(() => {
    return controlledSelectedId &&
      locations.some((l) => l.id === controlledSelectedId)
      ? controlledSelectedId
      : (controlledSelectedId ?? '');
  }, [controlledSelectedId, locations]);

  const [selectedId, setSelectedId] = React.useState<string>(initialSelectedId);

  React.useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const options = React.useMemo(() => {
    if (selectedId && !locations.some((l) => l.id === selectedId)) {
      return [{id: selectedId, label: 'Saved pickup location'}, ...locations];
    }
    return locations;
  }, [locations, selectedId]);

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
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedId(newId);
                const handleToSave = newId.replace(
                  /^gid:\/\/shopify\/Location\//,
                  '',
                );
                const payload = {
                  action: CartForm.ACTIONS.BuyerIdentityUpdate,
                  inputs: {
                    buyerIdentity: newId
                      ? {
                          preferences: {
                            delivery: {
                              pickupHandle: [handleToSave],
                              deliveryMethod: ['PICK_UP'],
                            },
                          },
                        }
                      : {
                          preferences: {
                            delivery: {
                              pickupHandle: [],
                              deliveryMethod: ['SHIPPING'],
                            },
                          },
                        },
                  },
                } as const;
                const formData = new FormData();
                formData.append('cartFormInput', JSON.stringify(payload));
                fetcher.submit(formData, {method: 'POST', action: '/cart'});
              }}
              disabled={disabled || fetcher.state !== 'idle'}
            >
              <option value="">No preference</option>
              {options.map((location) => (
                <option value={location.id} key={location.id}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </CartForm>
      <p style={{marginTop: 8, fontSize: 12, opacity: 0.8}}>
        Your selection is saved to cart preferences for checkout.
      </p>
    </div>
  );
}
