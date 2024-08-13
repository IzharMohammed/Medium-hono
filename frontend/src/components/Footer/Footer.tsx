import React from 'react'

function Footer() {
    return (
        <footer className='border border-slate-700 bg-slate-100 p-3 h-28 relative mt-auto'>
            <div className='flex justify-around'>
                <div>
                    <div className='font-bold'>Company</div>
                    <div>About Us</div>
                    <div>
                        Careers
                    </div>
                    <div>Contact</div>
                </div>

                <div>
                    <div className='font-bold'>Products</div>
                    <div>Medium</div>
                    <div>
                        Clap
                    </div>
                    <div>Membership</div>
                </div>

                <div>
                    <div className='font-bold'>Resources</div>
                    <div>Blog</div>
                    <div>
                        Help center
                    </div>
                    <div>writers</div>
                </div>

                <div>

                    <div className='font-bold'>Legal</div>
                    <div>Terms of Service</div>
                    <div>
                        Privacy Policy
                    </div>
                    <div>Cookie Policy</div>
                </div>
            </div>
        </footer>
    )
}

export default Footer