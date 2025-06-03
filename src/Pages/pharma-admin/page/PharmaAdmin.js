import React from 'react'
import PharmaSidebar from '../component/PharmaSidebar'
import { Outlet } from 'react-router-dom'
import '../pharma.css';

const PharmaAdmin = () => {


    

    return (
        <div className='pharmaAdminContainer'>
            <div className='pharmaSidebar'>
                <PharmaSidebar />
            </div>
            <div className='pharmaAdminContent'>
                <Outlet/>
            </div>
        </div>
    )
}

export default PharmaAdmin
