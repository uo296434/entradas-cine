import React from 'react';
import withRouter from './withRouter';
import { PageHeader, Button, Col, Row } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { notification } from 'antd';

class TicketsList extends React.Component {
    constructor(props) {
        super(props);
        this.id = this.props.params.id;
        this.state = {
            tickets: [],
            seats: [],
            selectedSeats: [],
            totalPrice: 0
        };
        this.getTicketsSummary(this.id);
    }

    getTicketsSummary = async (id) => {
        const { data, error } = await this.props.supabase
            .from('ticket')
            .select()
            .eq('session_id', id);

        if (error == null) {
            const seats = data.map((ticket) => ({
                id: ticket.id,
                row: ticket.row,
                seat: ticket.seat,
                status: ticket.status,
                price: ticket.price,
            }));
            seats.sort((a, b) => a.id - b.id);
            this.setState({
                tickets: data,
                seats: seats,
            });
        }
    };

    handleSeatClick = async (seat) => {        
        var currentTotalPrice = this.state.totalPrice;
        var currentSelectedSeats = this.state.selectedSeats;
        if (seat.status === 'disponible') {
            currentTotalPrice += seat.price;
            currentSelectedSeats.push(seat);
            const updatedSeats = this.state.seats.map((s) =>
                s.id === seat.id ? { ...s, status: 'seleccionado' } : s
            );
            this.setState({ 
                seats: updatedSeats,
                selectedSeats: currentSelectedSeats,
                totalPrice: currentTotalPrice
            });
        } else if (seat.status === 'seleccionado') {
            currentTotalPrice -= seat.price;
            currentSelectedSeats = currentSelectedSeats.filter((s) => s.id !== seat.id);
            const { data, error } = await this.props.supabase
                .from('ticket')
                .update({ status: 'disponible' })
                .eq('id', seat.id);
    
            if (error == null) {
                const updatedSeats = this.state.seats.map((s) =>
                    s.id === seat.id ? { ...s, status: 'disponible' } : s
                );
                this.setState({ 
                    tickets: data,
                    seats: updatedSeats,
                    selectedSeats: currentSelectedSeats,
                    totalPrice: currentTotalPrice
                });
            }
        } else if (seat.status === 'ocupado') {
            notification.info({
                message: 'Asiento ocupado',
                duration: 3,
                description: 'El asiento está ocupado, por favor seleccione otro asiento.',
            });
        }
    };

    buyTicket = async (selectedSeatsArray) => {
        const { data: { user } } = await this.props.supabase.auth.getUser();
      
        if (user != null) {
            const promises = selectedSeatsArray.map(async (seat) => {
                const { data, error } = await this.props.supabase
                    .from('shopping_cart')
                    .insert([
                        {
                            ticket_id: seat.id,
                            buyer: user.email,
                            price: seat.price,
                            pay: 'pendiente',
                        },
                    ]);

                var errorResult = error;

                const { data2, error2 } = await this.props.supabase
                    .from('ticket')
                    .update({ status: 'ocupado' })
                    .eq('id', seat.id);

                if (error2 == null) {
                    const updatedSeats = this.state.seats.map((s) =>
                        s.id === seat.id ? { ...s, status: 'ocupado' } : s
                    );
                    this.setState({ 
                        tickets: data2,
                        seats: updatedSeats
                    });
                } else if (error2 != null) {
                    errorResult = error2;
                }
    
                return errorResult;
            });
        
            const results = await Promise.all(promises);
        
            const numError = results.filter((error) => error == null).length;

            console.log(numError);
            console.log(selectedSeatsArray.length);
        
            if (numError === selectedSeatsArray.length && numError === 1) {
                notification.info({
                    message: 'Entrada añadida',
                    duration: 3,
                    description: 'La entrada se ha añadido correctamente al carrito',
                });
            } else if (numError === selectedSeatsArray.length) {
                notification.info({
                    message: 'Entradas añadidas',
                    duration: 3,
                    description: 'Las entradas se han añadido correctamente al carrito',
                });
            }

            this.setState({                
                selectedSeats: [],
                totalPrice: 0
            })
        } else {
            this.props.navigate('/login');
        }
    };

    render() {
        const { seats, selectedSeats, totalPrice } = this.state;
        const rows = 4;
        const seatsPerRow = 5;
        const seatRows = [];

        for (let row = 0; row < rows; row++) {
            const rowSeats = seats.slice(row * seatsPerRow, (row + 1) * seatsPerRow);
            seatRows.push(rowSeats);
        }

        return (
            <PageHeader title={'Entradas:'}>
                <div>
                    {seatRows.map((rowSeats, rowIndex) => (
                        <Row gutter={[16, 16]} key={rowIndex}>
                            {rowSeats.map((seat) => {
                                const isSelected = seat.status === 'seleccionado';
                                const isOccupied = seat.status === 'ocupado';

                                let seatImage = 'seat.png';
                                if (isSelected) {
                                    seatImage = 'selected_seat.png';
                                } else if (isOccupied) {
                                    seatImage = 'occupied_seat.png';
                                }

                                return (
                                    <Col  xs={4} sm={4} md={4} lg={3} xl={2} key={seat.id}>
                                        <div
                                            onClick={() => this.handleSeatClick(seat)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: seat.status === 'disponible' ? 'pointer' : 'default',
                                            }}
                                        >
                                            <img
                                                src={`https://jfbitiqhttjjzcrxatys.supabase.co/storage/v1/object/public/images/${seatImage}`}
                                                alt="Seat"
                                                style={{ width: 50, height: 50 }}
                                            />
                                            {isSelected && (
                                                <div>
                                                    <p style={{ marginBottom: 5 }}><i>Fila:</i> {seat.row}</p>
                                                    <p style={{ marginBottom: 5 }}><i>Asiento:</i> {seat.seat}</p>
                                                    <p style={{ marginBottom: 20 }}><i>Precio:</i> {seat.price} €</p>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    ))}
                </div>
                {(selectedSeats.length > 0) && (
                    <div style={{ marginTop: 30 }}>
                        <p style={{ fontSize: 16, marginBottom: 10 }}><b>Precio total:</b> {totalPrice.toFixed(2)}</p>
                        <Button
                            type="primary"
                            onClick={() => this.buyTicket(selectedSeats)}
                            icon={<ShoppingOutlined />}
                        >
                            Añadir al carrito
                        </Button>
                    </div>
                )}
            </PageHeader>
        );
    }
}

export default withRouter(TicketsList);
