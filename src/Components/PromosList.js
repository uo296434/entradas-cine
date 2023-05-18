import React from 'react';
import { Link } from "react-router-dom";
import { Card, Col, Row, Tag } from 'antd';

class PromosList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            promos : []
        }  
        this.getPromosSummary();
    }

    getPromosSummary = async () => {
        const { data, error } = await this.props.supabase
            .from('promotion')
            .select()
  
        if ( error == null){
            this.setState({
                promos : data
            }) 
        }
    }  

    render() { 
        return (
            <Row gutter={ [40, 40] } justify="center">
                { this.state.promos.map( promo => {
                    promo.linkTo = "/promo/"+promo.id;
                    let image = <img src={ process.env.REACT_APP_SUPBASE_STORAGE + "/imageMockup.png"} alt="Imagen por defecto" />
                    if (promo.image != null ){
                        image = <img src={ "https://jfbitiqhttjjzcrxatys.supabase.co/storage/v1/object/public/images/" + promo.image } alt="Imagen promoción" /> 
                    }
                    return ( 
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Link to={ promo.linkTo }>
                                <Card hoverable key={promo.id} title={ <b>{promo.title}</b> } 
                                    cover={ image }>
                                    <div style={ {textAlign: 'right'} }>
                                        <Tag style={ {fontSize: 14} } color="blue">{ promo.price } €</Tag>
                                    </div>
                                </Card>
                            </Link>
                        </Col>  
                    )
                })}
            </Row>
        )
    }
}

export default PromosList;