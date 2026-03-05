import { Routes, Route } from 'react-router-dom';
import { MessageDock } from '@/components/ui/message-dock';
import Home from '@/pages/Home';
import Pricing from '@/pages/Pricing';
import Breakdown from '@/pages/Breakdown';
import Info from '@/pages/Info';
import Contact from '@/pages/Contact';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/breakdown" element={<Breakdown />} />
        <Route path="/info" element={<Info />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <MessageDock theme="light" enableAnimations />
    </>
  );
}
