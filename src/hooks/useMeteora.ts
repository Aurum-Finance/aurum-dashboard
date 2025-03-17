import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { MeteoraProgramService } from "../services/MeteoraProgramService";

export function useMeteora() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const meteoraProgram = useMemo(() => {
        return new MeteoraProgramService(connection);
    }, [connection]);

    return {
        program: meteoraProgram,
        wallet,
        connected: wallet.connected,
        publicKey: wallet.publicKey,
    };
}
