export interface CliArgs {
  targetDir: string;
  external: boolean;
  json: boolean;
  ignorePatterns: string[];
  timeoutMs: number;
  concurrency: number;
  help: boolean;
  version: boolean;
}

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_CONCURRENCY = 8;

export class ArgError extends Error {}

/** Parses CLI arguments (excluding the node/script prefix). */
export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    targetDir: '.',
    external: false,
    json: false,
    ignorePatterns: [],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    concurrency: DEFAULT_CONCURRENCY,
    help: false,
    version: false,
  };

  let sawTargetDir = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    switch (arg) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--version':
      case '-v':
        args.version = true;
        break;
      case '--external':
        args.external = true;
        break;
      case '--json':
        args.json = true;
        break;
      case '--ignore':
        args.ignorePatterns.push(requireValue(argv, ++i, '--ignore'));
        break;
      case '--timeout':
        args.timeoutMs = requirePositiveInt(argv, ++i, '--timeout');
        break;
      case '--concurrency':
        args.concurrency = requirePositiveInt(argv, ++i, '--concurrency');
        break;
      default:
        if (arg.startsWith('-')) {
          throw new ArgError(`Unknown option: ${arg}`);
        }
        if (sawTargetDir) {
          throw new ArgError(`Unexpected extra argument: ${arg}`);
        }
        args.targetDir = arg;
        sawTargetDir = true;
    }
  }

  return args;
}

function requireValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (value === undefined) {
    throw new ArgError(`${flag} requires a value`);
  }
  return value;
}

function requirePositiveInt(argv: string[], index: number, flag: string): number {
  const raw = requireValue(argv, index, flag);
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new ArgError(`${flag} requires a positive number, got: ${raw}`);
  }
  return value;
}

export const HELP_TEXT = `md-link-checker — scan Markdown files for broken links, missing files, and invalid anchors

Usage:
  md-link-checker [directory] [options]

Arguments:
  directory              Directory to scan (default: ".")

Options:
  --external             Also validate http(s) links by making requests to them
  --json                 Print machine-readable JSON instead of formatted text
  --ignore <pattern>     Ignore files/folders matching pattern (repeatable)
  --timeout <ms>         Timeout per external link request (default: ${DEFAULT_TIMEOUT_MS})
  --concurrency <n>      Max concurrent external link requests (default: ${DEFAULT_CONCURRENCY})
  -h, --help             Show this help message
  -v, --version          Show the installed version

Examples:
  md-link-checker .
  md-link-checker docs/
  md-link-checker . --external
  md-link-checker . --json
  md-link-checker . --ignore node_modules --ignore dist
`;
