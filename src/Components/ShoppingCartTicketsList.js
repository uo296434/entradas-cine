import React from 'react';
import { Button, Table } from 'antd';
import { notification } from 'antd';

class ShoppingCartTicketsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            purchased_tickets: [],
            infoTickets: []
        };
        this.getPurchasedTickets();
    }

    getPurchasedTickets = async () => {
        const { data: { user } } = await this.props.supabase.auth.getUser();

        if (user != null) {
            const { data, error } = await this.props.supabase
                .from('shopping_cart')
                .select('*')
                .eq('buyer', user.email)
                .is('promotion_id', null)
                .eq('pay', 'pendiente');

            if (error == null) {
                this.setState({ purchased_tickets: data }, () => {
                    this.getTickets();
                });
            }
        }
    };

    getTickets = async () => {
        const infoTickets = await Promise.all(
            this.state.purchased_tickets.map((element) => this.getInfoTicket(element.ticket_id))
        );

        this.setState({ 
            infoTickets: infoTickets
        });
    };

    getInfoTicket = async (id) => {
        const { data, error } = await this.props.supabase
            .from('tickets_cart_shopping')
            .select()
            .eq('id', id);

        if (error == null && data.length > 0) {
            const infoTicket = { ...data[0], key: 'table' + id };
            return infoTicket;
        }
    };

    deleteTicket = async (id) => {
        const { data: { user } } = await this.props.supabase.auth.getUser();

        if (user != null) {
            const { data, error } = await this.props.supabase
                .from('shopping_cart')
                .delete()
                .match({ ticket_id: id });

            const { data2, error2 } = await this.props.supabase
                .from('ticket')
                .update({ status: 'disponible' })
                .eq('id', id);

            if (error == null && error2 == null) {
                this.getPurchasedTickets();
                notification.info({
                    message: 'Entrada eliminada',
                    duration: 3,
                    description: 'Ha devuelto la entrada comprada',
                });
            }
        }
    };

    render() {
        const { infoTickets } = this.state;

        function formatDate(date) {
            const [year, month, day] = date.split('-');
            return `${day}-${month}-${year}`;
        }

        function formatHour(hour) {
            const [hours, minutes] = hour.split(':');
            return `${hours}:${minutes}`;
        }

        const columnsTickets = [
            {
                title: 'Película',
                dataIndex: 'title',
            },
            {
                title: 'Día',
                dataIndex: 'date',
                align: 'right',
                render: (date) => <span>{formatDate(date)}</span>,
            },
            {
                title: 'Hora',
                dataIndex: 'hour',
                align: 'right',
                render: (hour) => <span>{formatHour(hour)}</span>,
            },
            {
                title: 'Sala',
                dataIndex: 'room',
            },
            {
                title: 'Fila',
                dataIndex: 'row',
                align: 'right',
            },
            {
                title: 'Asiento',
                dataIndex: 'seat',
                align: 'right',
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
                render: (id) => (
                    <div>
                        <Button type="link" onClick={() => this.deleteTicket(id)}>
                        Devolver
                        </Button>
                    </div>
                ),
            },
        ];

        return (
            <Table
                columns={columnsTickets}
                dataSource={infoTickets}
            />
        );
    }
}

export default ShoppingCartTicketsList;