import '../styles/Home.css';

function Home() {

  return(
      <div className = "background">
        <div className="details d-flex flex-column justify-content-center">
          <h3 className='text-left'>Welcome to MVGR Time Table generator!</h3>
          <p className='text-left'>View and customize your time table according to your needs.</p>
          <div className='d-flex justify-content-end pad'>
            <a href='/login' className='text'>Get Started -{">"}</a>
          </div>
        </div>
      </div> 
    
  )
};  

export default Home;