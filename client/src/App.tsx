import './App.css'
import Form from './components/Form';
import LeadsList from './components/LeadsList';
function App() {

  return (
    <>
      <div className="App">
        <h1 className="text-3xl text-center my-8">Lead Management System</h1>
        <Form />
        <LeadsList />
      </div>
    </>
  )
}

export default App
