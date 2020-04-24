import React from "react";
import {Pokemon} from "../../models/pokemon";
import {EventPublisher, EventSubscriber, EventSubscription} from "../../core/event-bus";
import {PokemonCard} from "./pokemon-card";

type CartEventItemContract = Pokemon & {total: number}

interface CartEventContract {
    items: CartEventItemContract[]
}

interface Props {
    pokemons: Pokemon[];
    eventPublisher: EventPublisher;
    eventListener: EventSubscriber;
}

interface State {
    pokemons: CartEventItemContract[],
    items: CartEventItemContract[]
}

export class PokemonList extends React.Component<Props, State> {
    state = {
        pokemons: [],
        items: []
    }
    private subscription: EventSubscription;

    render(): React.ReactNode {
        return <>
            <style jsx>{`
              section {
                display: grid;
                grid-gap: 20px;
                grid-auto-rows: 1fr;
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
              }
              @media only screen and (max-width: 1400px) {
                section {
                  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                }
              }
              @media only screen and (max-width: 1280px) {
                section {
                  grid-template-columns: 1fr 1fr 1fr 1fr;
                }
              }
              @media only screen and (max-width: 980px) {
                section {
                  grid-template-columns: 1fr 1fr 1fr;
                }
              }
              @media only screen and (max-width: 720px) {
                section {
                  grid-template-columns: 1fr 1fr;
                }
              }
              @media only screen and (max-width: 600px) {
                section {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
            <section>
                {this.state.pokemons.map((pokemon) =>
                    <PokemonCard
                        key={pokemon.id}
                        pokemon={pokemon}
                        total={pokemon.total}
                        eventPublisher={this.props.eventPublisher} />)}

                    {this.props.children}
            </section>
        </>
    }

    componentDidMount(): void {
        this.subscription = this.props.eventListener('CART_SERVICE_ITEMS', (cart: CartEventContract) => {
            this.setState({
                items: cart.items,
                pokemons: this.mapPokemonWithCartItems(cart.items)
            })
        })

        this.addPokemonsToState();
    }

    componentDidUpdate(prevProps): void {
        if (prevProps === this.props) {
            return;
        }
        this.addPokemonsToState();
    }

    private addPokemonsToState() {
        this.props.eventPublisher('CART_SERVICE_ASK_FOR_ITEMS');

        this.setState({
            pokemons: this.mapPokemonWithCartItems(this.state.items)
        });
    }

    componentWillUnmount(): void {
        this.subscription.unsubscribe();
    }

    private mapPokemonWithCartItems(cartItems: CartEventItemContract[]) {
        return this.props.pokemons.map((pokemon) => ({
            ...pokemon,
            total: this.getTotalForPokemon(cartItems, pokemon),
        }));
    }

    private getTotalForPokemon(cartItems: CartEventItemContract[], pokemon: Pokemon) {
        const item = cartItems.find((item) => item.id === pokemon.id);

        if (item) {
            return item.total;
        }

        return 0;
    }
}