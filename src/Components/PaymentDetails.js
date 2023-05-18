import React from 'react';
import withRouter from './withRouter';
import { PageHeader, Card, Button, Form, Input, notification } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';

class PaymentDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            payments: [],
            totalPrice: 0,
            cardNumber: '',
            expiryDate: '',
            cvv: '',
        };
        this.getPayments();
    }

    getPayments = async () => {
        const { data: { user } } = await this.props.supabase.auth.getUser();

        if (user != null) {
            const { data, error } = await this.props.supabase
                .from('shopping_cart')
                .select('*')
                .eq('buyer', user.email)
                .eq('pay', 'pendiente');

            console.log(data);

            if (error == null) {
                this.setState({ 
                    payments: data
                }, () => {
                    this.getTotalPrice();
                });
            }
        }
    };

    getTotalPrice = async () => {
        var totalPrice = 0;
        this.state.payments.map((payment) => totalPrice += payment.price)

        this.setState({ 
            totalPrice: totalPrice.toFixed(2)
        });
    };

    handleCardNumberChange = (event) => {
        this.setState({ cardNumber: event.target.value });
    };

    handleExpiryDateChange = (event) => {
        this.setState({ expiryDate: event.target.value });
    };

    handleCVVChange = (event) => {
        this.setState({ cvv: event.target.value });
    };

    handleSubmit = async () => {
        try {
            const updatePromises = this.state.payments.map(async (payment) => {
                await this.props.supabase
                    .from('shopping_cart')
                    .update({ pay: 'pagado' })
                    .eq('id', payment.id);
            });
        
            await Promise.all(updatePromises);
        
            notification.success({
                message: 'Pago exitoso',
                duration: 3,
                description: 'El pago se ha realizado correctamente.',
            });

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {        
            notification.error({
                message: 'Error al realizar el pago',
                duration: 3,
                description: 'Ha ocurrido un error al procesar el pago.',
            });
        }
    };

    render() {
        return (
            <PageHeader title={'Pago:'}>
                <div>                    
                    <Card>
                        <Form name="basic" labelCol={{span: 24/2}} wrapperCol={{ span: 24/2}}
                            onFinish={this.handleSubmit} autoComplete="off">

                            <Form.Item label="Precio total:" style={{fontWeight: 'bold'}}>
                                <span><i>{this.state.totalPrice} €</i></span>
                            </Form.Item>

                            <Form.Item label="Número de tarjeta:" name="tarjeta"
                                rules={[ 
                                    { required: true,message: 'Por favor ingresa el número de tarjeta',},
                                ]}>
                                <Input style={{ maxWidth: 250 }}
                                    value={this.state.cardNumber}
                                    onChange={this.handleCardNumberChange}
                                />
                            </Form.Item>

                            <Form.Item label="Fecha de vencimiento:" name="fecha"
                                rules={[ 
                                    { required: true,message: 'Por favor ingresa la fecha de vencimiento',},
                                ]}>
                                <Input style={{ maxWidth: 75 }} placeholder='MM/YY'
                                    value={this.state.expiryDate}
                                    onChange={this.handleExpiryDateChange}
                                />
                            </Form.Item>

                            <Form.Item label="CVV:" name="cvv"
                                rules={[ 
                                    { required: true,message: 'Por favor ingresa el CVV',},
                                ]}>
                                <Input style={{ maxWidth: 50 }} placeholder='000'
                                    value={this.state.cvv}
                                    onChange={this.handleCVVChange}
                                />
                            </Form.Item>
                            
                            <Form.Item wrapperCol={{ xs: { offset: 0 }, sm: { offset: 11, span: 24/3 } }}>
                                <Button type="primary" htmlType="submit" icon={<ShoppingOutlined/>} size="large">Pagar</Button>
                            </Form.Item>
                            
                        </Form>
                    </Card>
                </div>
            </PageHeader>
        );
    }
}

export default withRouter(PaymentDetails);