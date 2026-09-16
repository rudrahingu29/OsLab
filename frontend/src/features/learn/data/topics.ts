export interface ImportantTerm {
  term: string;
  definition: string;
}

export interface AdvantagesLimitations {
  advantages: string[];
  limitations: string[];
}

export interface TopicContent {
  concept: string;
  simpleExplanation: string;
  whyNeeded: string;
  howItWorks: string;
  visualExample: {
    title: string;
    description: string;
    diagramType: 'blocks' | 'flowchart' | 'states';
    elements: string[];
  };
  realWorldContext: string;
  importantTerms: ImportantTerm[];
  advantagesLimitations: AdvantagesLimitations;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  isComplete: boolean;
  miniOsScenario?: string;
  labLink?: string;
  overview?: string;
  content?: TopicContent;
}

export const topics: Topic[] = [
  {
    id: 'intro-to-os',
    title: '1. Introduction to Operating Systems',
    slug: 'intro-to-os',
    description: 'Learn what an operating system is and why it is the most critical software on any computer.',
    icon: 'cpu',
    isComplete: false,
    content: {
      concept: 'An Operating System (OS) is a specialized system software that acts as an intermediary between computer hardware and user applications. It manages hardware resources and provides fundamental runtime services.',
      simpleExplanation: 'Think of a computer system like a busy airport. The hardware (runways, planes, gates) are physical assets. The passengers and airlines are applications. The Operating System is Air Traffic Control—ensuring planes land and take off safely without colliding.',
      whyNeeded: 'Without an OS, application developers would have to program custom code for every physical motherboard, graphics card, and hard drive model in existence. An OS abstracts hardware into standard APIs.',
      howItWorks: 'When powered on, the firmware (BIOS/UEFI) loads the OS bootloader into RAM. The OS kernel initializes memory tables, process queues, and device drivers, remaining active in memory continuously.',
      visualExample: {
        title: 'System Architecture Layers',
        description: 'Layered structure showing OS position between applications and hardware.',
        diagramType: 'blocks',
        elements: ['Users & Applications', 'System Call Interface', 'Operating System Kernel', 'Physical Hardware (CPU, RAM, Disk)']
      },
      realWorldContext: 'Laptops run Windows or macOS, smartphones run Android or iOS, while servers and cloud data centers run Linux.',
      importantTerms: [
        { term: 'Kernel', definition: 'The core program of an OS with complete access to system hardware.' },
        { term: 'Abstraction', definition: 'Hiding physical hardware complexities behind simple, standard interfaces.' },
        { term: 'System Call', definition: 'The programmatic request mechanism applications use to ask the OS kernel for services.' }
      ],
      advantagesLimitations: {
        advantages: ['Enables hardware sharing among multiple applications', 'Provides robust security boundaries', 'Standardizes software development'],
        limitations: ['Consumes system CPU and RAM overhead', 'Kernel bugs can cause full system crashes']
      }
    }
  },
  {
    id: 'hardware-architecture',
    title: '2. Computer Hardware & OS Architecture',
    slug: 'hardware-architecture',
    description: 'Understand CPU registers, system buses, interrupts, memory hierarchy, and storage.',
    icon: 'server',
    isComplete: false,
    content: {
      concept: 'Operating Systems operate directly on physical hardware primitives: CPU registers, System Buses (Data, Address, Control), Hardware Interrupt Lines, Memory Hierarchy, and Peripheral Controllers.',
      simpleExplanation: 'Think of computer hardware as a high-speed factory. Registers are the tools in a worker\'s hands, RAM is the workbench, and the Hard Drive is the warehouse down the street. The OS manages how materials move between them.',
      whyNeeded: 'Software execution speed depends on hardware alignment. Understanding clock cycles, cache hits, and interrupt requests is essential for OS design.',
      howItWorks: 'The CPU executes instructions from RAM sequentially using the Instruction Pointer (IP) register. When an I/O event occurs (e.g. keypress), hardware sends an Electrical Interrupt signal to the CPU Interrupt Controller, triggering an Interrupt Service Routine (ISR).',
      visualExample: {
        title: 'Hardware System Bus & Memory Hierarchy',
        description: 'Memory hierarchy pyramid from fast registers to slow secondary storage.',
        diagramType: 'flowchart',
        elements: ['CPU Registers (<1 ns)', 'L1/L2/L3 Cache (1-10 ns)', 'Main Memory / RAM (50-100 ns)', 'NVMe SSD / HDD (100 µs - 10 ms)']
      },
      realWorldContext: 'When you press a key on your keyboard, an electrical interrupt signals the CPU immediately, interrupting current work to process your input in microseconds.',
      importantTerms: [
        { term: 'Interrupt Vector', definition: 'A table of memory pointers referencing specific Interrupt Service Routines (ISRs).' },
        { term: 'Bus', definition: 'High-speed electrical communication pathways connecting CPU, RAM, and peripherals.' },
        { term: 'Cache Memory', definition: 'Small, ultrafast SRAM located directly on the CPU die.' }
      ],
      advantagesLimitations: {
        advantages: ['Hardware interrupts enable asynchronous event handling', 'Memory hierarchy balances extreme speed with large capacity'],
        limitations: ['Hardware propagation delay limits maximum clock speeds']
      }
    }
  },
  {
    id: 'user-vs-kernel-mode',
    title: '3. User Mode vs Kernel Mode',
    slug: 'user-vs-kernel-mode',
    description: 'Hardware-level CPU protection modes to prevent applications from crashing the system.',
    icon: 'shield-check',
    isComplete: false,
    miniOsScenario: 'cpu-mode-inspector',
    content: {
      concept: 'Dual-Mode Operation uses hardware CPU Mode Bits to separate unprivileged application execution (User Mode, Ring 3) from privileged kernel execution (Kernel Mode, Ring 0).',
      simpleExplanation: 'Think of a hotel. Hotel guests (User Mode) can access their assigned rooms and lobby. Only hotel staff (Kernel Mode) have master keys that open electrical rooms, boiler rooms, and security vaults.',
      whyNeeded: 'Prevents buggy or malicious user programs from disabling hardware interrupts, overwriting OS memory, or shutting down physical hardware.',
      howItWorks: 'The CPU contains a physical Mode Bit (1 for User Mode, 0 for Kernel Mode). Privileged CPU instructions (e.g. `cli`, `outb`) can execute ONLY when Mode Bit is 0. Executing them in User Mode triggers a hardware exception trap.',
      visualExample: {
        title: 'CPU Dual-Mode Transition',
        description: 'User Application trapping into Kernel Mode and returning after execution.',
        diagramType: 'states',
        elements: ['User Mode (Mode Bit = 1)', 'Trap Instruction / Syscall', 'Kernel Mode (Mode Bit = 0)', 'Return-from-Trap']
      },
      realWorldContext: 'When a program attempts to divide by zero or access null memory, the CPU hardware catches the illegal instruction in User Mode and delegates crash handling to the OS kernel.',
      importantTerms: [
        { term: 'Mode Bit', definition: 'Hardware status register bit indicating current processor privilege level.' },
        { term: 'Ring 0 / Ring 3', definition: 'x86 CPU privilege rings, where Ring 0 is Kernel Mode and Ring 3 is User Mode.' }
      ],
      advantagesLimitations: {
        advantages: ['Ensures system security and fault isolation', 'Prevents runaway programs from corrupting hardware'],
        limitations: ['Mode switching adds minor CPU instruction latency']
      }
    }
  },
  {
    id: 'system-calls',
    title: '4. System Calls & Kernel API',
    slug: 'system-calls',
    description: 'The programmatic interface user applications use to request services from the kernel.',
    icon: 'terminal',
    isComplete: false,
    miniOsScenario: 'system-call-tracer',
    content: {
      concept: 'System Calls form the programmatic API boundary between user-space applications and privileged operating system kernel services.',
      simpleExplanation: 'Think of a bank vault window. Customers (applications) cannot walk inside the vault. They submit a transaction slip (System Call) to the bank teller (OS Kernel), who performs the operation safely.',
      whyNeeded: 'Controls all access to disk storage, network sockets, memory allocation, and process creation through safe, validated APIs.',
      howItWorks: 'Applications call library wrappers (C standard library `printf`, `malloc`). The wrapper executes a software trap (`syscall` or `int 0x80`), passing the system call number in registers. The kernel indexes the System Call Table and executes the routine.',
      visualExample: {
        title: 'System Call Invocation Sequence',
        description: 'Application invoking write() system call through libc and trap dispatch table.',
        diagramType: 'flowchart',
        elements: ['User Code (`write()`)', 'C Library Wrapper', 'Software Trap (`syscall`)', 'Kernel Syscall Table', 'Hardware Driver Routine']
      },
      realWorldContext: 'Opening a file (`open`), creating a process (`fork`), reading network data (`recv`), or allocating memory (`brk/mmap`) all issue system calls under the hood.',
      importantTerms: [
        { term: 'POSIX', definition: 'Portable Operating System Interface standards specifying standard system call APIs across UNIX/Linux.' },
        { term: 'System Call Number', definition: 'Unique integer index mapping system calls to specific kernel function pointers.' }
      ],
      advantagesLimitations: {
        advantages: ['Enforces parameter validation and security checks', 'Provides portable application interfaces across hardware'],
        limitations: ['Context switching between User Mode and Kernel Mode adds CPU cycle overhead']
      }
    }
  },
  {
    id: 'processes',
    title: '5. Processes & PCB',
    slug: 'processes',
    description: 'Understand what a process is, its memory segments, and the Process Control Block.',
    icon: 'activity',
    isComplete: false,
    miniOsScenario: 'process-creation',
    content: {
      concept: 'A process is an active program in execution. It includes the program code, current activity (Program Counter), CPU registers, memory segments (Text, Data, Heap, Stack), and open resources.',
      simpleExplanation: 'A "program" is a printed recipe sitting in a cookbook on a shelf. A "process" is the active chef cooking the meal in the kitchen with ingredients (RAM) and utensils (CPU).',
      whyNeeded: 'Provides process isolation so that independent applications can run concurrently without interfering with each other\'s memory or resources.',
      howItWorks: 'When an app is launched, the OS loads code and static data into RAM, creates a stack and heap, and allocates a Process Control Block (PCB) tracking PID, state, registers, memory maps, and file descriptors.',
      visualExample: {
        title: 'Process Memory Structure & PCB',
        description: 'Memory segment allocation: Text, Data, Heap (grows up), Stack (grows down), and PCB.',
        diagramType: 'blocks',
        elements: ['Text Segment (Code)', 'Data Segment (Globals)', 'Heap (Dynamic RAM)', 'Stack (Local Vars)', 'Process Control Block (PCB)']
      },
      realWorldContext: 'Opening 3 tabs in Google Chrome creates separate OS processes. If one tab crashes due to bad JavaScript, the other tabs remain active.',
      importantTerms: [
        { term: 'PCB (Process Control Block)', definition: 'Kernel data structure holding complete state metadata for a specific process.' },
        { term: 'PID', definition: 'Unique numeric Process Identifier assigned by the kernel.' }
      ],
      advantagesLimitations: {
        advantages: ['Strong memory protection and isolation', 'Enables concurrent execution of distinct tasks'],
        limitations: ['Process creation and context switching require memory and CPU management overhead']
      }
    }
  },
  {
    id: 'process-states',
    title: '6. Process Lifecycle & States',
    slug: 'process-states',
    description: 'Learn the lifecycle transitions a process goes through from creation to termination.',
    icon: 'git-branch',
    isComplete: false,
    miniOsScenario: 'process-lifecycle',
    content: {
      concept: 'During execution, a process transitions through canonical states: New, Ready, Running, Waiting (Blocked), and Terminated.',
      simpleExplanation: 'Think of a runner in a race: \n- New: Registering at the starting booth.\n- Ready: Standing on the track waiting for the starter pistol.\n- Running: Sprinting on the track (CPU).\n- Waiting: Pausing to drink water (I/O operation).\n- Terminated: Crossing the finish line.',
      whyNeeded: 'Allows the OS scheduler to manage CPU allocation efficiently by ignoring processes blocked on slow I/O devices.',
      howItWorks: 'Processes in Ready state reside in the Ready Queue. When scheduled, state becomes Running. If an I/O request occurs, state moves to Waiting and CPU is reassigned. When I/O completes, an interrupt moves the process back to Ready.',
      visualExample: {
        title: '5-State Process Lifecycle Diagram',
        description: 'State machine showing New -> Ready <-> Running -> Terminated, and Running -> Waiting -> Ready.',
        diagramType: 'states',
        elements: ['New State', 'Ready Queue', 'Running on CPU', 'Waiting for I/O', 'Terminated State']
      },
      realWorldContext: 'When saving a file in a text editor, the process enters Waiting state while the disk writes the blocks, freeing the CPU for music playback.',
      importantTerms: [
        { term: 'Context Switch', definition: 'Saving current process registers/state and loading next process state into the CPU.' },
        { term: 'Dispatcher', definition: 'OS module that performs context switching and jumps to the newly selected process.' }
      ],
      advantagesLimitations: {
        advantages: ['Maximizes CPU utilization by executing Ready tasks while others wait for I/O', 'Enables responsive time-sharing'],
        limitations: ['Context switching consumes CPU cycles (switching overhead)']
      }
    }
  },
  {
    id: 'threads-multithreading',
    title: '7. Threads & Multithreading',
    slug: 'threads-multithreading',
    description: 'Explore lightweight threads of execution, thread pools, and shared memory models.',
    icon: 'network',
    isComplete: false,
    content: {
      concept: 'A Thread is the basic unit of CPU utilization, comprising a thread ID, program counter, register set, and stack. Multiple threads within the same process share code, data, and OS resources.',
      simpleExplanation: 'A process is an entire house. A single-threaded process has one person doing chores sequentially. A multithreaded process has three people working simultaneously inside the same house, sharing the same kitchen and tools!',
      whyNeeded: 'Creating a process is expensive. Threads provide lightweight concurrency within a single application with zero inter-process memory copying overhead.',
      howItWorks: 'Threads share the heap and data segments of their parent process, but each thread maintains its own private Stack and Register state. Operating systems schedule User Threads or Kernel Threads onto multiple CPU cores.',
      visualExample: {
        title: 'Single-Threaded vs Multithreaded Process',
        description: 'Processes with single thread vs multiple threads sharing Heap and Code segments.',
        diagramType: 'blocks',
        elements: ['Shared Code & Data Segment', 'Thread 1 (Stack + Registers)', 'Thread 2 (Stack + Registers)', 'Thread 3 (Stack + Registers)']
      },
      realWorldContext: 'Web servers (like NGINX or Node.js thread pools) use multiple threads to handle thousands of incoming HTTP requests concurrently.',
      importantTerms: [
        { term: 'POSIX Pthreads', definition: 'Standard C/C++ API library for creating and synchronizing threads on POSIX systems.' },
        { term: 'Concurrency vs Parallelism', definition: 'Concurrency is managing multiple tasks at once; Parallelism is executing multiple tasks physically at the same time on multi-core CPUs.' }
      ],
      advantagesLimitations: {
        advantages: ['Lightweight creation and fast context switching', 'Shared memory makes data communication instant'],
        limitations: ['Shared memory access requires synchronization to avoid race conditions']
      }
    }
  },
  {
    id: 'inter-process-communication',
    title: '8. Inter-Process Communication (IPC)',
    slug: 'inter-process-communication',
    description: 'How independent processes exchange data using Pipes, Message Queues, Shared Memory, and Sockets.',
    icon: 'share-2',
    isComplete: false,
    content: {
      concept: 'Inter-Process Communication (IPC) mechanisms allow isolated processes to exchange data and synchronize actions.',
      simpleExplanation: 'If two workers sit in different locked rooms, they can communicate via: \n- Shared Memory: A whiteboard built into the dividing wall.\n- Message Passing: Slipping notes under the door.\n- Sockets: Talking over a telephone line.',
      whyNeeded: 'Because processes are isolated by default, the OS must provide secure IPC mechanisms for cooperative applications.',
      howItWorks: 'IPC models include Shared Memory (fastest, direct memory access after setup), Anonymous/Named Pipes (`cat file | grep text`), Message Queues, and Network Sockets (TCP/UDP).',
      visualExample: {
        title: 'IPC Shared Memory vs Message Passing',
        description: 'Comparison of Shared Memory region vs Kernel Message Queue passing.',
        diagramType: 'flowchart',
        elements: ['Process A', 'Shared RAM Region', 'Kernel Message Queue', 'Process B']
      },
      realWorldContext: 'In Linux CLI, typing `cat access.log | grep 404 | wc -l` uses anonymous IPC Pipes to pass data streams between three processes.',
      importantTerms: [
        { term: 'Pipe', definition: 'A unidirectional data channel connecting the standard output of one process to the input of another.' },
        { term: 'Socket', definition: 'An IPC endpoint providing network or local domain communication between processes.' }
      ],
      advantagesLimitations: {
        advantages: ['Enables modular software design', 'Shared Memory provides ultra-high-speed data exchange'],
        limitations: ['Message Passing incurs copy overhead; Shared Memory requires complex locking']
      }
    }
  },
  {
    id: 'cpu-scheduling',
    title: '9. CPU Scheduling Algorithms',
    slug: 'cpu-scheduling',
    description: 'Discover how the kernel decides which ready process gets to run on the CPU next.',
    icon: 'clock',
    isComplete: false,
    labLink: '/os-lab/cpu-scheduling',
    content: {
      concept: 'CPU Scheduling selects processes from the Ready queue and allocates CPU cycles to optimize throughput, turnaround time, waiting time, and response time.',
      simpleExplanation: 'Imagine an airport taxi stand: \n- FCFS: First passenger in line gets the first taxi.\n- SJF: Passenger with the shortest trip gets the taxi first.\n- Round Robin: Every passenger gets a 2-minute ride, then goes to the back of the line if not done.',
      whyNeeded: 'Prevents single runaway processes from monopolizing the CPU and maintains fast UI responsiveness.',
      howItWorks: 'Preemptive schedulers use hardware timer interrupts (e.g., every 10 ms). Algorithms evaluated include FCFS, SJF, SRTF, Priority Scheduling, Round Robin, and Multi-Level Feedback Queues (MLFQ).',
      visualExample: {
        title: 'Gantt Chart Execution Timeline',
        description: 'Timeline illustrating processes scheduled across CPU time slots.',
        diagramType: 'flowchart',
        elements: ['Process P1 [0-4 ms]', 'Process P2 [4-7 ms]', 'Process P3 [7-12 ms]', 'Context Switch Overhead']
      },
      realWorldContext: 'Linux uses the Completely Fair Scheduler (CFS), which uses red-black trees to track virtual runtime and allocate CPU cycles proportionally.',
      importantTerms: [
        { term: 'Turnaround Time', definition: 'Total time elapsed from process submission to completion.' },
        { term: 'Time Quantum', definition: 'Fixed execution time slice allocated to each process in Round Robin.' },
        { term: 'MLFQ', definition: 'Multi-Level Feedback Queue scheduler that dynamically adjusts process priorities based on behavior.' }
      ],
      advantagesLimitations: {
        advantages: ['Maximizes system throughput and CPU utilization', 'Ensures interactive UI responsiveness'],
        limitations: ['Improper time quanta lead to excessive context switches or starvation']
      }
    }
  },
  {
    id: 'synchronization-race-conditions',
    title: '10. Process Synchronization & Race Conditions',
    slug: 'synchronization-race-conditions',
    description: 'Prevent concurrent access bugs, race conditions, and critical section errors.',
    icon: 'sliders',
    isComplete: false,
    content: {
      concept: 'Process Synchronization coordinates concurrent threads accessing shared resources to prevent Race Conditions and maintain data consistency.',
      simpleExplanation: 'Imagine a joint bank account with $100. Two people try to withdraw $80 at the exact same second at different ATMs. Without synchronization, both ATMs check balance ($100), approve both withdrawals, and leave the account at -$60!',
      whyNeeded: 'Concurrent execution on shared memory without synchronization leads to non-deterministic bugs and data corruption.',
      howItWorks: 'Code accessing shared data is called the Critical Section. Solutions enforce Mutual Exclusion, Progress, and Bounded Waiting using Peterson\'s Algorithm or hardware atomic instructions (`TestAndSet`, `CompareAndSwap`).',
      visualExample: {
        title: 'Critical Section Entry & Exit Protocol',
        description: 'Flow chart showing Entry Section -> Critical Section -> Exit Section -> Remainder.',
        diagramType: 'flowchart',
        elements: ['Entry Section (Acquire Lock)', 'Critical Section (Shared Access)', 'Exit Section (Release Lock)', 'Remainder Section']
      },
      realWorldContext: 'E-commerce ticket booking systems use mutual exclusion locks so two users cannot purchase the exact same seat simultaneously.',
      importantTerms: [
        { term: 'Race Condition', definition: 'A scenario where final outcome depends on the non-deterministic timing/order of execution.' },
        { term: 'Critical Section', definition: 'A region of code that accesses shared variables or resources.' },
        { term: 'Atomic Operation', definition: 'An uninterruptible hardware instruction executed as a single indivisible unit.' }
      ],
      advantagesLimitations: {
        advantages: ['Guarantees data consistency across threads', 'Eliminates race conditions'],
        limitations: ['Lock contention can cause thread waiting and reduced parallel performance']
      }
    }
  },
  {
    id: 'semaphores-mutexes',
    title: '11. Semaphores, Mutexes & Monitors',
    slug: 'semaphores-mutexes',
    description: 'Master synchronization primitives: Mutex locks, Counting Semaphores, and Monitors.',
    icon: 'key',
    isComplete: false,
    content: {
      concept: 'Semaphores and Mutexes are kernel synchronization primitives used to enforce mutual exclusion and manage shared resource access limits.',
      simpleExplanation: 'A Mutex is a single bathroom key—only one person can hold the key at a time. A Counting Semaphore is a parking garage sign showing 5 available spaces—each arriving car decrements the count, and when it reaches 0, incoming cars must wait.',
      whyNeeded: 'Provides high-level, reliable locking abstractions to solve classic synchronization problems (Producer-Consumer, Readers-Writers, Dining Philosophers).',
      howItWorks: 'A Mutex supports `lock()` and `unlock()`. A Semaphore supports atomic `wait()` (P) and `signal()` (V) operations. If a resource is unavailable, the calling thread is placed in a sleep queue.',
      visualExample: {
        title: 'Counting Semaphore Queue Mechanism',
        description: 'Semaphore counter decrementing as threads claim resource slots.',
        diagramType: 'states',
        elements: ['Semaphore Value = N', 'Thread Wait() [Value--]', 'Critical Work Execution', 'Thread Signal() [Value++]']
      },
      realWorldContext: 'Database connection pools use Counting Semaphores to limit maximum concurrent connections to 20, blocking additional requests until a slot opens.',
      importantTerms: [
        { term: 'Mutex (Mutual Exclusion Lock)', definition: 'A binary locking primitive owned by a single thread at a time.' },
        { term: 'Semaphore', definition: 'An integer variable accessed through atomic wait() and signal() operations.' },
        { term: 'Priority Inversion', definition: 'A problem where a high-priority thread waits for a low-priority thread holding a lock.' }
      ],
      advantagesLimitations: {
        advantages: ['Solves complex multi-threaded synchronization problems', 'Sleep queues avoid wasteful CPU busy-waiting'],
        limitations: ['Incorrect semaphore sequencing can cause deadlocks or priority inversion']
      }
    }
  },
  {
    id: 'deadlocks',
    title: '12. Deadlocks & Resource Allocation',
    slug: 'deadlocks',
    description: 'When two or more processes are permanently stuck waiting for each other.',
    icon: 'lock',
    isComplete: false,
    miniOsScenario: 'deadlock-simulation',
    content: {
      concept: 'A Deadlock is a state where a set of processes are permanently blocked because each process holds a resource needed by another process in a circular dependency.',
      simpleExplanation: 'Two drivers reach a narrow single-lane bridge from opposite directions. Neither can move forward, and neither driver will back up. Both cars are stuck forever!',
      whyNeeded: 'Uncontrolled deadlocks cause system freezes, requiring manual restarts or process termination.',
      howItWorks: 'Deadlocks require four Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Schedulers handle deadlocks via Prevention, Avoidance (Banker\'s Algorithm), or Detection & Recovery.',
      visualExample: {
        title: 'Circular Wait Resource Allocation Graph',
        description: 'Circular dependency loop: Process A -> Resource 2 -> Process B -> Resource 1 -> Process A.',
        diagramType: 'states',
        elements: ['Process A (Holds R1)', 'Request Arrow to R2', 'Process B (Holds R2)', 'Request Arrow to R1']
      },
      realWorldContext: 'Database engines automatically detect circular transaction deadlocks and kill/rollback the cheapest transaction to free locks.',
      importantTerms: [
        { term: 'Coffman Conditions', definition: 'The 4 necessary conditions required for a deadlock to exist.' },
        { term: 'Banker\'s Algorithm', definition: 'Deadlock avoidance algorithm that checks if resource allocation leaves the system in a Safe State.' },
        { term: 'Circular Wait', definition: 'A closed chain of processes where each process waits for a resource held by the next.' }
      ],
      advantagesLimitations: {
        advantages: ['Deadlock avoidance guarantees execution safety', 'Detection algorithms automatically recover system health'],
        limitations: ['Avoidance algorithms require predefined max resource declarations']
      }
    }
  },
  {
    id: 'memory-management',
    title: '13. Main Memory Management',
    slug: 'memory-management',
    description: 'How the OS allocates physical RAM partitions and manages memory fragmentation.',
    icon: 'layers',
    isComplete: false,
    labLink: '/os-lab/memory-management',
    miniOsScenario: 'memory-allocation',
    content: {
      concept: 'Memory Management tracks physical RAM, allocating memory blocks to active processes and managing fragmentation.',
      simpleExplanation: 'RAM is a giant parking lot. The OS memory manager acts as the valet attendant assigning parking spots to incoming cars so they don\'t crash and space isn\'t wasted.',
      whyNeeded: 'Ensures memory protection between processes while optimizing physical RAM utilization.',
      howItWorks: 'Supports Contiguous Memory Allocation using Fixed or Variable Partitions. Algorithms include First-Fit, Best-Fit, Worst-Fit, and Next-Fit. Memory compaction merges free holes.',
      visualExample: {
        title: 'Physical RAM Allocation & Fragmentation Map',
        description: 'Memory blocks allocated to P1, P2, P3 with unallocated holes.',
        diagramType: 'blocks',
        elements: ['Kernel Space (256 MB)', 'Process P1 (512 MB)', 'Free Memory Hole', 'Process P2 (1024 MB)', 'External Fragmentation']
      },
      realWorldContext: 'When launching a game, the OS reserves contiguous RAM for graphics assets and program variables.',
      importantTerms: [
        { term: 'First-Fit', definition: 'Allocates the first free memory hole large enough for the process.' },
        { term: 'Internal Fragmentation', definition: 'Unused space inside an allocated fixed partition.' },
        { term: 'External Fragmentation', definition: 'Total free memory is sufficient for a request, but divided into small non-contiguous holes.' }
      ],
      advantagesLimitations: {
        advantages: ['Provides fast memory access', 'Prevents memory boundary crossing'],
        limitations: ['Dynamic variable partitioning suffers from external fragmentation']
      }
    }
  },
  {
    id: 'paging-segmentation',
    title: '14. Paging & Segmentation',
    slug: 'paging-segmentation',
    description: 'Explore non-contiguous memory management: Page Tables, TLB, and Segments.',
    icon: 'grid',
    isComplete: false,
    labLink: '/os-lab/memory-management',
    content: {
      concept: 'Paging divides memory into fixed-size physical Frames and logical Pages, permitting non-contiguous allocation and completely eliminating external fragmentation.',
      simpleExplanation: 'Instead of requiring a book to be printed on a single giant sheet of paper, Paging breaks the book into standard numbered pages. Pages can be placed in any available binder slot (RAM frame).',
      whyNeeded: 'Contiguous allocation suffers from severe external fragmentation. Paging allows a process to be loaded into non-contiguous RAM frames anywhere.',
      howItWorks: 'CPU generates Virtual Addresses divided into Page Number (p) and Offset (d). The Page Table maps page number to physical Frame Number (f). Translation Lookaside Buffer (TLB) acts as a high-speed hardware cache for page entries.',
      visualExample: {
        title: 'Virtual Page Table & TLB Translation',
        description: 'Virtual Address -> TLB Lookup -> Page Table -> Physical RAM Frame.',
        diagramType: 'flowchart',
        elements: ['Virtual Address (p, d)', 'TLB Cache Check', 'Page Table Directory', 'Physical RAM Frame (f, d)']
      },
      realWorldContext: 'Modern 64-bit CPUs use 4-level paging schemes with 4 KB page sizes to manage terabytes of RAM efficiently.',
      importantTerms: [
        { term: 'TLB (Translation Lookaside Buffer)', definition: 'Ultra-fast hardware CPU cache storing recent page table translations.' },
        { term: 'Frame', definition: 'Fixed-size block of physical RAM.' },
        { term: 'Page', definition: 'Fixed-size block of virtual memory space matching frame size.' }
      ],
      advantagesLimitations: {
        advantages: ['Completely eliminates external fragmentation', 'Enables easy shared memory between processes'],
        limitations: ['Page table lookup adds memory access overhead without TLB cache']
      }
    }
  },
  {
    id: 'virtual-memory',
    title: '15. Virtual Memory & Page Replacement',
    slug: 'virtual-memory',
    description: 'The illusion of infinite memory using a combination of RAM and secondary disk storage.',
    icon: 'database',
    isComplete: false,
    labLink: '/os-lab/memory-management',
    miniOsScenario: 'virtual-memory-swap',
    content: {
      concept: 'Virtual Memory decouples logical memory from physical RAM, using Demand Paging and Page Replacement algorithms (FIFO, LRU, Optimal) to swap pages to secondary storage.',
      simpleExplanation: 'Your desk is RAM; a storage cabinet behind you is the Hard Drive. When your desk gets full, you temporarily move old files to the cabinet (swap out). When needed, you fetch them back (swap in).',
      whyNeeded: 'Allows execution of massive applications that exceed physical RAM size.',
      howItWorks: 'When accessing a page marked Not Present in RAM, a Page Fault exception occurs. The kernel fetches the page from disk. If RAM is full, Page Replacement algorithms evict a victim page to swap space.',
      visualExample: {
        title: 'Demand Paging & Page Fault Handling',
        description: 'Page Fault Handler fetching missing page from disk swap to RAM frame.',
        diagramType: 'flowchart',
        elements: ['Memory Reference', 'Page Fault Trap', 'Locate Page on Disk', 'Swap In to Free Frame', 'Update Page Table']
      },
      realWorldContext: 'Linux uses `swap` space and Windows uses `pagefile.sys` so you can open dozens of apps simultaneously without running out of RAM.',
      importantTerms: [
        { term: 'Page Fault', definition: 'Hardware exception triggered when accessing a page not loaded in RAM.' },
        { term: 'LRU (Least Recently Used)', definition: 'Page replacement algorithm evicting the page unused for the longest time.' },
        { term: 'Thrashing', definition: 'Severe performance degradation when the CPU spends more time swapping pages than executing.' }
      ],
      advantagesLimitations: {
        advantages: ['Executes programs larger than physical RAM', 'Increases degree of multiprogramming'],
        limitations: ['Page faults to magnetic/SSD storage cause disk I/O latency']
      }
    }
  },
  {
    id: 'disk-management',
    title: '16. Storage Hardware & Disk Scheduling',
    slug: 'disk-management',
    description: 'Optimize read/write head movement across physical disk cylinders.',
    icon: 'disc',
    isComplete: false,
    labLink: '/os-lab/disk-scheduling',
    miniOsScenario: 'disk-io-monitor',
    content: {
      concept: 'Disk Scheduling algorithms order I/O requests to minimize physical read/write head seek distance and latency on storage media.',
      simpleExplanation: 'Think of a skyscraper elevator. Instead of moving up and down randomly for floor requests, the elevator sweeps smoothly from bottom to top, serving floors in path order (SCAN / Elevator algorithm).',
      whyNeeded: 'Mechanical disk arm movement is orders of magnitude slower than CPU/RAM speed. Smart scheduling maximizes I/O throughput.',
      howItWorks: 'The disk scheduler queues track requests and applies FCFS, SSTF (Shortest Seek Time First), SCAN, C-SCAN, LOOK, or C-LOOK to optimize head travel.',
      visualExample: {
        title: 'Disk Track Seek Graph',
        description: 'Plot of track cylinders vs request steps illustrating head sweep path.',
        diagramType: 'flowchart',
        elements: ['Request Queue', 'Initial Head Track', 'Cylinder Sweep Path', 'Serviced Disk Track']
      },
      realWorldContext: 'Database servers handling thousands of queries use C-LOOK disk scheduling to maintain high data throughput.',
      importantTerms: [
        { term: 'Seek Time', definition: 'Time taken for the disk head to move to the requested cylinder track.' },
        { term: 'SSTF', definition: 'Algorithm servicing the request closest to current head position.' },
        { term: 'Elevator (SCAN)', definition: 'Head sweeps back and forth across disk cylinders servicing pending requests.' }
      ],
      advantagesLimitations: {
        advantages: ['Drastically reduces total seek time', 'Increases storage I/O bandwidth'],
        limitations: ['SSTF can cause starvation for requests on far outer tracks']
      }
    }
  },
  {
    id: 'file-systems',
    title: '17. File Systems & Directory Hierarchy',
    slug: 'file-systems',
    description: 'How data is organized, stored, named, and retrieved on storage devices.',
    icon: 'folder-tree',
    isComplete: false,
    miniOsScenario: 'file-system-explorer',
    content: {
      concept: 'File Systems manage storage organization, directory trees, file metadata (inodes), block allocation, and access permissions.',
      simpleExplanation: 'A file system is a library catalog. Instead of throwing books in a random heap, books are placed in labeled shelves (directories) with index cards (inodes/metadata).',
      whyNeeded: 'Without a file system, storage devices are raw unorganized blocks of 0s and 1s.',
      howItWorks: 'File systems (ext4, NTFS, FAT32) divide storage into disk blocks. Inodes store metadata (permissions, owner, size, block pointers). Directories map filenames to inode numbers.',
      visualExample: {
        title: 'Directory Tree & Inode Block Pointers',
        description: 'Hierarchical path mapping through inodes to physical data blocks.',
        diagramType: 'blocks',
        elements: ['Root Directory (/)', 'Directory Entry (file.txt)', 'Inode Table Record', 'Physical Disk Blocks']
      },
      realWorldContext: 'Linux ext4 uses journaling to log file changes before writing, preventing file system corruption during unexpected power cuts.',
      importantTerms: [
        { term: 'Inode', definition: 'Data structure containing file metadata, ownership, permissions, and data block pointers.' },
        { term: 'Journaling', definition: 'Logging disk updates to a dedicated journal before writing to prevent corruption.' }
      ],
      advantagesLimitations: {
        advantages: ['Structured file organization and security access control', 'Journaling guarantees crash recovery'],
        limitations: ['File system metadata structures consume a portion of disk capacity']
      }
    }
  },
  {
    id: 'io-management',
    title: '18. I/O Subsystems & Device Drivers',
    slug: 'io-management',
    description: 'Communication between CPU, device drivers, buffering, and DMA controllers.',
    icon: 'cable',
    isComplete: false,
    miniOsScenario: 'io-device-manager',
    content: {
      concept: 'The I/O Subsystem abstracts peripheral hardware, providing uniform device interfaces, buffering, spooling, device drivers, and DMA controllers.',
      simpleExplanation: 'Device drivers are universal translators. The OS speaks standard requests ("Print Page"), and the driver translates that into specific hardware signals for a specific printer model.',
      whyNeeded: 'Peripheral hardware varies widely in speed and operation. Applications require device-independent APIs.',
      howItWorks: 'Uses Device Drivers, Interrupt Handlers, Circular Buffers, Spooling queues, and Direct Memory Access (DMA) to transfer data straight into RAM without CPU looping.',
      visualExample: {
        title: 'I/O Subsystem Architecture & DMA',
        description: 'Application -> System Call -> Device Driver -> DMA Controller -> Peripheral.',
        diagramType: 'blocks',
        elements: ['User Application', 'I/O System Call', 'Device Driver', 'DMA Controller', 'Hardware Peripheral']
      },
      realWorldContext: 'Plugging in a USB drive triggers driver mounting, letting the kernel read storage data directly via DMA.',
      importantTerms: [
        { term: 'Device Driver', definition: 'Kernel software module converting standard I/O requests to hardware commands.' },
        { term: 'DMA (Direct Memory Access)', definition: 'Hardware feature transferring data directly between I/O device and RAM without CPU overhead.' }
      ],
      advantagesLimitations: {
        advantages: ['Uniform device APIs across heterogeneous hardware', 'DMA offloads CPU data transfer work'],
        limitations: ['Flawed third-party device drivers can compromise kernel security']
      }
    }
  },
  {
    id: 'security-protection',
    title: '19. Operating System Security & Protection',
    slug: 'security-protection',
    description: 'Defend the OS against internal vulnerabilities and external security attacks.',
    icon: 'shield',
    isComplete: false,
    miniOsScenario: 'security-auditor',
    content: {
      concept: 'Security protects system assets against unauthorized external attacks, while Protection enforces internal resource authorization policies across users.',
      simpleExplanation: 'Protection is the lock on your bedroom door. Security is the alarm system and front gate guarding the entire house against intruders.',
      whyNeeded: 'Safeguards confidential data, enforces multi-user privacy, and prevents malicious software execution.',
      howItWorks: 'Implements Access Control Lists (ACLs), user permission bits (`chmod`), password hashing (SHA-256/bcrypt), privilege escalation control (`sudo`/UAC), and address space layout randomization (ASLR).',
      visualExample: {
        title: 'Access Control Matrix & Permission Check',
        description: 'User Authentication -> Access Control Matrix -> Granted / Denied.',
        diagramType: 'blocks',
        elements: ['User Authentication', 'Access Control List (ACL)', 'Resource Object', 'Permission Granted / Denied']
      },
      realWorldContext: 'Linux file permissions (`rwxr-xr-x`) ensure standard users cannot modify system configuration files in `/etc/`.',
      importantTerms: [
        { term: 'Principle of Least Privilege', definition: 'Granting processes and users only the minimum permissions necessary.' },
        { term: 'ACL (Access Control List)', definition: 'Table listing permissions for users on specific system objects.' }
      ],
      advantagesLimitations: {
        advantages: ['Enforces system confidentiality and data integrity', 'Prevents unauthorized administrative escalation'],
        limitations: ['Frequent permission verification adds administrative overhead']
      }
    }
  },
  {
    id: 'virtualization-containers',
    title: '20. Virtualization & Containerization',
    slug: 'virtualization-containers',
    description: 'Explore Hypervisors, Virtual Machines, Docker containers, namespaces, and cgroups.',
    icon: 'boxes',
    isComplete: false,
    content: {
      concept: 'Virtualization uses Hypervisors to run multiple full OS instances on physical hardware. Containerization uses OS-level kernel isolation (Namespaces, cgroups) to run lightweight applications.',
      simpleExplanation: 'A Virtual Machine is building a complete miniature apartment inside your house (complete with its own plumbing and kitchen). A Container is partitioning a room with a curtain—sharing the main house plumbing and electrical, but keeping space isolated!',
      whyNeeded: 'Maximizes cloud server hardware utilization and enables rapid software deployment across identical containerized environments.',
      howItWorks: 'Type 1 Hypervisors (KVM, ESXi) run directly on bare metal. Type 2 Hypervisors (VirtualBox) run on a host OS. Containers (Docker) use Linux Namespaces (PID, Mount, Net) and Control Groups (cgroups) for OS-level virtualization.',
      visualExample: {
        title: 'Hypervisor Architecture vs Container Engine',
        description: 'Hardware -> Hypervisor -> Guest OS vs Hardware -> Host OS -> Container Engine -> Apps.',
        diagramType: 'blocks',
        elements: ['Host Hardware', 'Hypervisor / Container Engine', 'Guest OS / Isolated Namespace', 'Application Workload']
      },
      realWorldContext: 'Cloud platforms like AWS, Google Cloud, and Kubernetes run millions of Docker containers and Virtual Machines to power the global internet.',
      importantTerms: [
        { term: 'Hypervisor', definition: 'Software layer creating and running virtual machines (Type 1 bare-metal or Type 2 hosted).' },
        { term: 'cgroups (Control Groups)', definition: 'Linux kernel feature limiting and isolating resource usage (CPU, Memory, Disk I/O) for process groups.' },
        { term: 'Namespaces', definition: 'Linux feature providing isolated workspace views (Process IDs, Network, Mount points) for containers.' }
      ],
      advantagesLimitations: {
        advantages: ['Ultra-fast application deployment with containers', 'High cloud server consolidation and isolation'],
        limitations: ['Virtual Machines introduce hypervisor memory and CPU overhead']
      }
    }
  }
];
