import React from 'react';
import { Button } from 'antd';
import { Table } from 'antd';
import { notification } from 'antd';

class ShoppingCartPromosList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            purchased_promos : [],            
            infoPromos: []
        }
        this.getPurchasedPromos();
    }

    getPurchasedPromos = async () => {
        const { data: { user } } = await this.props.supabase.auth.getUser();

        if (user != null){
            const { data, error } = await this.props.supabase
                .from('shopping_cart')
                .select('*')
                .eq('buyer', user.email)                
                .is('ticket_id', null)                
                .eq('pay', 'pendiente');

            console.log(error);

            if ( error == null){
                this.setState({ purchased_promos: data }, () => {
                    this.getPromos();
                });
            }
        }
    }

    getPromos = async () => {
        const infoPromos = await Promise.all(
            this.state.purchased_promos.map((element) => this.getInfoPromo(element.promotion_id))
        );

        this.setState({ 
            infoPromos: infoPromos
        });
    };

    getInfoPromo = async (id) => {
        const { data, error } = await this.props.supabase
            .from('promotion')
            .select()
            .eq('id', id);

        if (error == null && data.length > 0) {
            const infoPromo = { ...data[0], key: 'table' + id };
            return infoPromo;
        }
    };

    deletePromo = async (id) => {
        const { data: { user } } = await this.props.supabase.auth.getUser();

        if (user != null){
            const { data, error } = await this.props.supabase
                .from('shopping_cart')
                .delete()
                .match({ promotion_id: id })
  
            if ( error == null){
                this.getPurchasedPromos();

                notification.info({
                    message: "Promoción eliminada",
                    duration: 3,
                    description: 'Ha devuelto la promoción comprada',
                });  
            }
        }
    }

    render() { 
        const { infoPromos } = this.state;

        let columnsPromos = [
            { 
                title: 'Nombre',
                dataIndex: 'title',
            },
            { 
                title: 'Precio',
                dataIndex: 'price',
                align: 'right',
                render: (price) => <span>{price} €</span>,
            },  
            { 
                title: 'Acciones',
                dataIndex: 'id',
                render: id => 
                    <div>
                        <Button type="link" onClick={() => this.deletePromo(id)}>Devolver</Button>
                    </div> ,
            },
        ]     

        return (
            <Table
                columns={columnsPromos}
                dataSource={infoPromos}
            />
        );
    }

}
  
export default ShoppingCartPromosList;