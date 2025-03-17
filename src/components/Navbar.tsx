import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Logo from "../../public/favicon.svg";
import Image from "next/image";

const Navbar = () => {
  const [active, setActive] = useState("Dashboard");

  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full px-[15px] py-[10px] border border-black/50">
        <Image src={Logo} alt="Logo" width={30} height={30} />
        <span className="text-lg text-black">AURUM</span>
      </div>
      <ul className="flex bg-[#D9D9D9] py-4 px-2 rounded-full gap-10 border border-black/50">
        {["Dashboard", "Position", "Yield", "History"].map((menu) => (
          <li key={menu}>
            <a
              href="#"
              className={`${
                active === menu
                  ? "bg-white text-black font-bold"
                  : "text-black font-normal"
              } px-4 py-3 rounded-full`}
              onClick={() => setActive(menu)}
            >
              {menu}
            </a>
          </li>
        ))}
      </ul>
      <WalletMultiButton className="custom-wallet-button" />
    </nav>
  );
};

export default Navbar;
