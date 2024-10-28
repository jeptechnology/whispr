const { useState, useCallback, useEffect } = require('react');

const useWebWorker = (workerFunction, inputData) => {
   const [outputData, setOutputData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   
   const memoizedWorkerFunction = useCallback(workerFunction, []);

   useEffect(() => {
      
      if (!inputData) {
         return;
      }
         
      setLoading(true);

      try {
         const code = memoizedWorkerFunction.toString();
         const blob = new Blob([`(${code})()`], { type: 'application/javascript' });
         const workerScriptURL = URL.createObjectURL(blob);
         const worker = new Worker(workerScriptURL);
         
         worker.postMessage(inputData);
         
         worker.onmessage = (e) => {
            setOutputData(e.data);
            setLoading(false);
         };
         
         worker.onerror = (e) => {
            setError(e.message);
            setLoading(false);
         };
         
         return () => {
            worker.terminate();
            URL.revokeObjectURL(worker);
         };

      } catch (error) {
         setError(error.message);
         setLoading(false);
      }      

   }, [inputData, memoizedWorkerFunction]);
   
   return { outputData, loading, error };
}

export default useWebWorker;