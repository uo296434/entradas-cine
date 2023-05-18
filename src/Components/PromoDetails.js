import React from 'react';
import withRouter from './withRouter';
import { Button, PageHeader, Descriptions, Image } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { notification } from 'antd';

class MovieDetails extends React.Component {

    constructor(props) {
        super(props)
        this.id = this.props.params.id;
        this.state = {
            promo : {}
        }
        this.getPromoDetails();
    }
  
    getPromoDetails = async () => {
        const { data, error } = await this.props.supabase
            .from('promotion')
            .select()
            .eq('id', this.id )
  
        if ( error == null && data.length > 0){
            this.setState({
                promo : data[0]
            }) 
        }
    }

    buyPromo = async () => {
        const { data: { user } } = await this.props.supabase.auth.getUser();
        
        if (user != null){
            const { data, error } = await this.props.supabase
                .from('shopping_cart')
                .insert([
                    { 
                        promotion_id: this.state.promo.id, 
                        buyer: user.email,
                        price: this.state.promo.price,
                        pay: 'pendiente',
                    }
                ])
    
            if ( error == null ){
                notification.info({
                    message: "Promoción comprada",
                    duration: 3,
                    description: 'La promoción se ha añadido correctamente al carrito',
                }); 
            }
        }
    }  
  
    render() {
        let image = process.env.REACT_APP_SUPBASE_STORAGE + "/imageMockup.png";
        if (this.state.promo.image != null) {
            image = "https://jfbitiqhttjjzcrxatys.supabase.co/storage/v1/object/public/images/" + this.state.promo.image
        }
        const bold = {
            fontWeight: 'bold'
        }
        return (
            <PageHeader title={ this.state.promo.title } 
                ghost={false} onBack={() => window.history.back()}>
                <div style={{ display: 'flex', marginTop: 10, marginBottom: 8}}>
                    <div style={{ marginRight: 35 }}>
                        <Image width={200} src={ image }/>
                    </div>                   
                    <Descriptions>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 100 }}>Descripción:</span>
                                <span>{ this.state.promo.description }</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item span={3}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ ...bold, minWidth: 100 }}>Precio:</span>
                                <span>{ this.state.promo.price } €</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item>
                            <Button style={{ display: 'flex', marginTop: 12 }} type="primary" onClick={() => this.buyPromo()} icon={<ShoppingOutlined/>} size="large">
                                Comprar promoción
                            </Button>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </PageHeader>
        )
    }
}

export default withRouter(MovieDetails);